/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { prisma } from "./server/db";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyGoogleToken,
  authenticateToken,
  AuthRequest
} from "./server/auth";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));


// Lazy-initialized Gemini client to prevent crashes if key is missing on startup
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. The app will fall back to rule-based suggestions.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Pre-configured backup suggestions in case the API key is not yet set
const FALLBACK_SUGGESTIONS = [
  {
    title: "Send a quick follow-up message",
    description: "Ping someone you spoke with recently. Check on their project or remind them of your proposal. It takes 3 minutes and keeps you top-of-mind.",
    category: "Business",
    type: "Follow-up",
    points: 3
  },
  {
    title: "Review your portfolio landing page",
    description: "Look at your personal CV or landing page with fresh eyes. Polish one sentence or update a single links/skills list.",
    category: "Career",
    type: "Portfolio Update",
    points: 4
  },
  {
    title: "Read 10 pages of a development book",
    description: "Spend 10 minutes leveling up your engineering knowledge. A little reading every day compounds immensely.",
    category: "Learning",
    type: "Read",
    points: 1
  },
  {
    title: "Do a quick 10-minute home workout",
    description: "Do 3 sets of pushups, squats, and planks. Physical fitness powers your mental clarity and opportunity-creation drive.",
    category: "Health",
    type: "Workout",
    points: 1
  },
  {
    title: "Set aside KSh 500 for your main project",
    description: "Transfer a small micro-savings amount into your project or farm investment jar. Consistent micro-saving adds up fast.",
    category: "Finance",
    type: "Saved Money",
    points: 2
  }
];

// Server-side API route for the "One More Opportunity" suggestions
app.post("/api/one-more", async (req, res) => {
  try {
    const { visions = [], recentOpportunities = [] } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      // Return 3 random fallback suggestions
      const shuffled = [...FALLBACK_SUGGESTIONS].sort(() => 0.5 - Math.random());
      return res.json({ suggestions: shuffled.slice(0, 3), source: "fallback" });
    }

    const visionsText = visions.length > 0
      ? visions.map((v: any) => `- Vision: "${v.title}" (${v.description || "No description"})`).join("\n")
      : "No specific long-term visions listed yet.";

    const recentText = recentOpportunities.length > 0
      ? recentOpportunities.slice(0, 10).map((o: any) => `- Logged: "${o.title}" in Category: "${o.category}" (${o.type})`).join("\n")
      : "No opportunities logged today yet.";

    const prompt = `You are a career and life accelerator coach. Your philosophy is: "Your life changes when the number of opportunities you create exceeds the number you wait for."
Based on the user's active visions and recent actions, generate 3 highly actionable, inspiring "One More Opportunity" actions they can take in 10-15 minutes right now.

Here is the user's current context:
=== Active Visions ===
${visionsText}

=== Recent Opportunities Logged ===
${recentText}

Available categories: Career, Business, Learning, Finance, Health, Personal, Side Projects, Farming.
Generate 3 distinct suggestions, each belonging to one of these categories. Ensure they are specific, realistic, and highly motivating. Return them in the specified JSON schema structure.`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A concise, motivating action title starting with an action verb (e.g., 'Draft a cold email to a tech recruiter', 'Review crop prices for onion seeds'). Max 60 characters." },
                  description: { type: Type.STRING, description: "A detailed 1-2 sentence explanation of why this action creates a new open door." },
                  category: { type: Type.STRING, description: "Must be exactly one of: Career, Business, Learning, Finance, Health, Personal, Side Projects, Farming." },
                  type: { type: Type.STRING, description: "The specific subtype representing this action." },
                  points: { type: Type.INTEGER, description: "The scoring weight from 1 to 10 reflecting the level of effort and initiative required (e.g., Cold Email = 8, Reading = 1, Workout = 1, CV Update = 5)." }
                },
                required: ["title", "description", "category", "type", "points"]
              }
            }
          }
        });
        break;
      } catch (err: any) {
        const errMessage = err?.message || String(err);
        const errStatus = err?.status || err?.code || 0;
        
        const isQuotaExceeded = errMessage.toLowerCase().includes("quota") || 
                                errMessage.includes("RESOURCE_EXHAUSTED") ||
                                String(errStatus).includes("RESOURCE_EXHAUSTED");

        const isTransient = (errStatus === 503 || errStatus === 429 || 
                            errMessage.includes("503") || errMessage.includes("429") || 
                            errMessage.includes("high demand") || errMessage.includes("temporary") ||
                            errMessage.includes("UNAVAILABLE")) && !isQuotaExceeded;

        if (isTransient && attempts < maxAttempts) {
          console.warn(`Gemini API attempt ${attempts} failed due to transient error (status ${errStatus}). Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2.5; // Exponential backoff with a factor of 2.5
        } else {
          // Throw immediately if quota exceeded or reached max attempts
          if (isQuotaExceeded) {
            console.warn(`Gemini API quota exceeded or exhausted (${errStatus}). Instantly falling back to rule-based suggestions.`);
          }
          throw err;
        }
      }
    }

    const text = response?.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const suggestions = JSON.parse(text.trim());
    return res.json({ suggestions, source: "gemini" });
  } catch (error: any) {
    const errMessage = error?.message || String(error);
    const isTransient = errMessage.includes("503") || errMessage.includes("429") || 
                        errMessage.includes("high demand") || errMessage.includes("temporary") ||
                        errMessage.includes("UNAVAILABLE") || error?.status === 503 || error?.code === 503;

    if (isTransient) {
      console.warn("Gemini API is temporarily unavailable. Gracefully falling back to rule-based suggestions.", errMessage);
    } else {
      console.error("Gemini API Error in server.ts:", error);
    }
    
    // Graceful error fallback
    const shuffled = [...FALLBACK_SUGGESTIONS].sort(() => 0.5 - Math.random());
    return res.json({
      suggestions: shuffled.slice(0, 3),
      source: "fallback",
      error: errMessage
    });
  }
});

// ==========================================
// Authentication Routes (Email/Password & Google)
// ==========================================

// 1. Email/Password Registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        passwordHash,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email });
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error?.message || "Failed to register user" });
  }
});

// 2. Email/Password Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error?.message || "Failed to log in" });
  }
});

// 3. Google OAuth Login / Sync
app.post("/api/auth/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "Google ID Token is required" });
    }

    const googlePayload = await verifyGoogleToken(idToken);
    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({ error: "Invalid or expired Google Token" });
    }

    const email = googlePayload.email.toLowerCase().trim();
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googlePayload.sub }, { email: email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: googlePayload.name || email.split("@")[0],
          googleId: googlePayload.sub,
          avatarUrl: googlePayload.picture || null,
        },
      });
    } else if (!user.googleId) {
      // Link googleId if user previously created account with email
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googlePayload.sub,
          avatarUrl: user.avatarUrl || googlePayload.picture || null,
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    console.error("Google Auth error:", error);
    return res.status(500).json({ error: error?.message || "Failed to authenticate with Google" });
  }
});

// 4. Get Logged-in User Profile
app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Failed to fetch user" });
  }
});

// ==========================================
// User State Sync Routes (Database Persistence)
// ==========================================

// 5. Get User Application State
app.get("/api/state", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userState = await prisma.userState.findUnique({ where: { userId: req.userId! } });
    if (!userState) {
      return res.json({ state: null });
    }
    return res.json({ state: JSON.parse(userState.stateJson) });
  } catch (error: any) {
    console.error("Error loading user state:", error);
    return res.status(500).json({ error: "Failed to load state from database" });
  }
});

// 6. Save User Application State
app.post("/api/state", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: "State content is required" });
    }

    await prisma.userState.upsert({
      where: { userId: req.userId! },
      update: { stateJson: JSON.stringify(state) },
      create: {
        userId: req.userId!,
        stateJson: JSON.stringify(state),
      },
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving user state:", error);
    return res.status(500).json({ error: "Failed to save state to database" });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with compiled assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
