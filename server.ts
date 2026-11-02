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
const PORT = Number(process.env.PORT) || 3000;

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

// Helper for heuristic extraction when Gemini is absent/offline
function heuristicExtractOpportunity(rawText: string) {
  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "New Opportunity";
  const lower = text.toLowerCase();

  // Category determination
  let category = "Career";
  if (lower.includes("scholarship") || lower.includes("fellowship") || lower.includes("bursary") || lower.includes("phd") || lower.includes("postdoc")) {
    category = "Scholarships";
  } else if (lower.includes("grant") || lower.includes("funding") || lower.includes("rfp") || lower.includes("tender") || lower.includes("proposal") || lower.includes("partnership") || lower.includes("client")) {
    category = "Business";
  } else if (lower.includes("freelance") || lower.includes("gig") || lower.includes("contract") || lower.includes("upwork") || lower.includes("fiverr")) {
    category = "Side Work";
  } else if (lower.includes("course") || lower.includes("certification") || lower.includes("tutorial") || lower.includes("book") || lower.includes("bootcamp")) {
    category = "Learning";
  } else if (lower.includes("investment") || lower.includes("stocks") || lower.includes("savings") || lower.includes("dividend") || lower.includes("crypto") || lower.includes("yield")) {
    category = "Finance";
  } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("marathon") || lower.includes("fitness") || lower.includes("nutrition")) {
    category = "Health";
  } else if (lower.includes("crop") || lower.includes("harvest") || lower.includes("poultry") || lower.includes("farm") || lower.includes("agri") || lower.includes("livestock") || lower.includes("seed")) {
    category = "Farming";
  } else if (lower.includes("hackathon") || lower.includes("open source") || lower.includes("app") || lower.includes("saas") || lower.includes("build")) {
    category = "Side Projects";
  }

  // Value extraction
  const valueMatch = text.match(/(?:(?:salary|compensation|value|budget|grant|award|pay|rate)[:\s]*)?([$€£]|KSh|UGX|USD)\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:k|k\/yr|\/yr|\/year|\/hr|\/month|M)?/i);
  const expectedValue = valueMatch ? valueMatch[0].trim() : undefined;

  // Deadline extraction
  const deadlineMatch = text.match(/(?:deadline|due date|closes on|apply by|closing date)[:\s]*([A-Za-z]+ \d{1,2}(?:, \d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  const deadline = deadlineMatch ? deadlineMatch[1].trim() : undefined;

  // Target entity
  const companyMatch = text.match(/(?:at|company|client|organization|university|sponsor)[:\s]+([A-Z][A-Za-z0-9&., ]{2,30})/);
  const companyOrClient = companyMatch ? companyMatch[1].trim() : undefined;

  // Tags
  const tags: string[] = [];
  if (lower.includes("remote")) tags.push("#remote");
  if (lower.includes("urgent") || lower.includes("immediate")) tags.push("#urgent");
  if (lower.includes("grant")) tags.push("#grant");
  if (lower.includes("fellowship")) tags.push("#fellowship");
  if (lower.includes("freelance")) tags.push("#freelance");
  if (tags.length === 0) tags.push("#high-priority");

  return {
    title: firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine,
    category,
    type: category === "Scholarships" ? "Fellowship" : category === "Business" ? "Proposal" : "Direct Application",
    companyOrClient: companyOrClient || "",
    expectedValue: expectedValue || "",
    deadline: deadline || "",
    eligibility: "",
    requirements: "",
    description: text.slice(0, 500),
    tags,
  };
}

// 2. AI Route: Smart Opportunity Parser
app.post("/api/ai/parse-opportunity", async (req, res) => {
  try {
    const { rawText = "" } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: "No text provided for analysis" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const parsed = heuristicExtractOpportunity(rawText);
      return res.json({ parsed, source: "heuristic" });
    }

    const prompt = `You are an executive opportunity intelligence parser.
Analyze this raw opportunity announcement, job description, scholarship posting, RFP, or email:
"""
${rawText.slice(0, 8000)}
"""

Extract structured opportunity fields. Follow these rules:
1. category must be one of: Career, Scholarships, Business, Side Work, Side Projects, Learning, Finance, Health, Personal, Farming.
2. title: concise, impactful title (e.g. "Senior Frontend Architect", "Gates Cambridge Fellowship", "AgriTech Seed Grant"). Max 75 chars.
3. companyOrClient: Organization, company, university, or client name.
4. expectedValue: salary, hourly rate, grant sum, or contract value with currency if present (e.g. "$140k/yr", "€20,000", "$60/hr", "KSh 250k"). Leave empty string if not mentioned.
5. deadline: specific deadline date string if mentioned (e.g. "2026-11-30" or "Nov 30, 2026"), else empty string.
6. type: subtype (e.g. "Full-time", "Master's Scholarship", "RFP Grant", "Freelance Contract").
7. eligibility: bullet points of eligibility criteria (1 per line).
8. requirements: bullet points of needed documents or application materials (1 per line).
9. description: 2-3 sentence polished summary of key duties, requirements, and opportunity highlights.
10. tags: array of 2-4 hashtag strings starting with '#' (e.g. ["#remote", "#grant", "#high-priority"]).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING },
            companyOrClient: { type: Type.STRING },
            expectedValue: { type: Type.STRING },
            deadline: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            requirements: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "category", "type", "description"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ parsed, source: "gemini" });
  } catch (error: any) {
    console.warn("AI Parser falling back to heuristics:", error?.message || error);
    const parsed = heuristicExtractOpportunity(req.body.rawText || "");
    return res.json({ parsed, source: "heuristic", warning: "Used offline parsing fallback" });
  }
});

// 3. AI Route: Tailored Application Pitch & Outreach Generator
app.post("/api/ai/generate-pitch", async (req, res) => {
  try {
    const { opportunity, pitchType = "cold_outreach", userNotes = "" } = req.body;
    if (!opportunity || !opportunity.title) {
      return res.status(400).json({ error: "Opportunity details required" });
    }

    const ai = getGeminiClient();
    const typeLabel = pitchType === "cover_letter"
      ? "Tailored Cover Letter Opener & Hook"
      : pitchType === "follow_up"
      ? "Polished Post-Submission / Post-Interview Follow-Up"
      : pitchType === "statement"
      ? "Scholarship Statement of Purpose Opening & Impact Pitch"
      : pitchType === "proposal"
      ? "Client Freelance / Project Proposal Executive Summary"
      : "High-Conversion Cold Outreach (Email / LinkedIn InMail)";

    if (!ai) {
      // High-quality fallback template
      const recipient = opportunity.companyOrClient ? `the team at ${opportunity.companyOrClient}` : "Hiring Manager";
      const draft = `Subject: Inquiry regarding ${opportunity.title} opportunity\n\nDear ${recipient},\n\nI am writing to express my strong enthusiasm for the ${opportunity.title} opportunity${opportunity.companyOrClient ? ` at ${opportunity.companyOrClient}` : ''}.\n\nWith extensive experience delivering impact in ${opportunity.category}, I was particularly drawn to this initiative because of its high alignment with my background in driving measurable outcomes.\n\n${userNotes ? `Specifically regarding your focus: ${userNotes}\n\n` : ''}I would welcome the opportunity to discuss how my skill set and proactive drive can create immediate value for your mission.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]\n[Your Portfolio / LinkedIn Link]`;
      return res.json({ draft, source: "fallback" });
    }

    const prompt = `You are a world-class career strategist and communication expert.
Draft a ${typeLabel} for the following opportunity:
- Role/Action: ${opportunity.title}
- Target Organization: ${opportunity.companyOrClient || "Target Organization"}
- Category: ${opportunity.category}
- Scope/Description: ${opportunity.description || "N/A"}
- User Specific Notes / Strengths: ${userNotes || "Proactive, outcome-driven professional with strong track record"}

Guidelines:
- Tone: Crisp, professional, confident, and value-focused.
- Do NOT use cliché filler (e.g. "I hope this email finds you well").
- Include a clear Subject Line if applicable.
- Tailor the pitch directly to what would impress the decision maker for this specific role.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const draft = response.text || "";
    return res.json({ draft, source: "gemini" });
  } catch (error: any) {
    console.error("Pitch generator error:", error);
    const recipient = req.body.opportunity?.companyOrClient || "Hiring Manager";
    const draft = `Subject: Re: ${req.body.opportunity?.title || 'Opportunity'}\n\nDear ${recipient},\n\nI am writing to share my strong interest in the ${req.body.opportunity?.title || 'opportunity'}. Having reviewed the scope and requirements, I am confident in my ability to contribute significant value from day one.\n\nI look forward to discussing next steps.\n\nBest regards,\n[Your Name]`;
    return res.json({ draft, source: "fallback" });
  }
});

// 4. AI Route: Fetch content from URL and extract opportunity details
app.post("/api/ai/fetch-url", async (req, res) => {
  try {
    const { url = "" } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ error: "Please provide a valid URL" });
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      return res.status(400).json({ error: "URL must begin with http:// or https://" });
    }

    // Fetch page with a 12s timeout and realistic user-agent
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const fetchResponse = await fetch(trimmedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!fetchResponse.ok) {
      return res.status(fetchResponse.status).json({
        error: `Could not fetch page (HTTP ${fetchResponse.status}: ${fetchResponse.statusText})`
      });
    }

    const html = await fetchResponse.text();

    // Clean HTML to readable text
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<(?:br|\/p|\/li|\/h\d|\/div)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n\n")
      .trim();

    if (cleanText.length < 50) {
      return res.status(400).json({
        error: "Extracted page content was too short or rendered entirely via client-side script. Try copying and pasting the text directly into the Text Parser tab."
      });
    }

    // Limit length for AI analysis
    const sampleText = cleanText.slice(0, 8000);

    const ai = getGeminiClient();
    if (!ai) {
      const parsed = heuristicExtractOpportunity(sampleText);
      return res.json({ rawText: sampleText, parsed, source: "heuristic" });
    }

    const prompt = `You are an executive opportunity intelligence parser.
Analyze this webpage text fetched from ${trimmedUrl}:
"""
${sampleText}
"""

Extract structured opportunity fields. Follow these rules:
1. category must be one of: Career, Scholarships, Business, Side Work, Side Projects, Learning, Finance, Health, Personal, Farming.
2. title: concise, impactful title (e.g. "Senior Frontend Architect", "Gates Cambridge Fellowship", "AgriTech Seed Grant"). Max 75 chars.
3. companyOrClient: Organization, company, university, or client name.
4. expectedValue: salary, hourly rate, grant sum, or contract value with currency if present (e.g. "$140k/yr", "€20,000", "$60/hr", "KSh 250k"). Leave empty string if not mentioned.
5. deadline: specific deadline date string if mentioned (e.g. "2026-11-30" or "Nov 30, 2026"), else empty string.
6. type: subtype (e.g. "Full-time", "Master's Scholarship", "RFP Grant", "Freelance Contract").
7. eligibility: bullet points of eligibility criteria (1 per line).
8. requirements: bullet points of needed documents or application materials (1 per line).
9. description: 2-3 sentence polished summary of key duties, requirements, and opportunity highlights.
10. tags: array of 2-4 hashtag strings starting with '#' (e.g. ["#remote", "#grant", "#high-priority"]).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            type: { type: Type.STRING },
            companyOrClient: { type: Type.STRING },
            expectedValue: { type: Type.STRING },
            deadline: { type: Type.STRING },
            eligibility: { type: Type.STRING },
            requirements: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "category", "type", "description"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({ rawText: sampleText, parsed, source: "gemini" });
  } catch (err: any) {
    console.error("URL fetch error:", err);
    return res.status(500).json({
      error: `Failed to fetch URL: ${err?.message || "Network request failed"}. You can also copy and paste the page text directly.`
    });
  }
});

// 5. AI Route: Candidate Resume & Role Matcher
app.post("/api/ai/match-resume", async (req, res) => {
  try {
    const { opportunity, resumeText = "" } = req.body;
    if (!opportunity || !opportunity.title) {
      return res.status(400).json({ error: "Opportunity details are required" });
    }
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: "Resume or profile text is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Offline heuristic matcher
      const oppString = `${opportunity.title} ${opportunity.category} ${opportunity.type || ""} ${opportunity.description || ""} ${opportunity.requirements || ""}`.toLowerCase();
      const resumeString = resumeText.toLowerCase();

      // Count common keyword matches
      const commonWords = ["react", "typescript", "javascript", "python", "full-stack", "frontend", "backend", "lead", "senior", "phd", "master", "gpa", "grant", "fellowship", "design", "agri", "farm", "finance", "cloud", "aws", "docker", "node", "sql", "sales", "client", "project", "management", "communication", "leadership"];
      let matchedCount = 0;
      let totalChecked = 0;
      const matchedKeywords: string[] = [];
      const missingKeywords: string[] = [];

      commonWords.forEach((word) => {
        if (oppString.includes(word)) {
          totalChecked++;
          if (resumeString.includes(word)) {
            matchedCount++;
            matchedKeywords.push(word);
          } else {
            missingKeywords.push(word);
          }
        }
      });

      const baseScore = totalChecked > 0 ? Math.round((matchedCount / totalChecked) * 100) : 75;
      const matchScore = Math.max(50, Math.min(95, baseScore));

      const verdict = matchScore >= 80 ? "Strong Match" : matchScore >= 65 ? "Competitive Match" : "Stretch Opportunity";
      const strengths = matchedKeywords.length > 0 
        ? matchedKeywords.slice(0, 4).map((k) => `Demonstrated alignment in ${k}`)
        : ["General domain familiarity in " + opportunity.category, "Demonstrated interest and proactive initiative"];

      const gaps = missingKeywords.length > 0
        ? missingKeywords.slice(0, 3).map((k) => `Unverified proof of hands-on experience in ${k}`)
        : ["Specific organizational case studies matching " + (opportunity.companyOrClient || "the target organization")];

      const recommendations = [
        `Tailor the application narrative around your verified strengths in ${opportunity.category}.`,
        `Explicitly address any requirements not directly listed in your resume in your cover letter.`,
        `Prepare 2 measurable impact stories demonstrating quick adaptability and proactive ownership.`
      ];

      return res.json({
        analysis: {
          matchScore,
          verdict,
          strengths,
          gaps,
          recommendations,
        },
        source: "heuristic"
      });
    }

    const prompt = `You are a top-tier executive talent evaluator and hiring committee member.
Perform an objective, deep Role Match & Skill Gap Analysis between this candidate's resume/profile and the opportunity.

=== Target Opportunity ===
Role Title: ${opportunity.title}
Target Organization: ${opportunity.companyOrClient || "Organization"}
Category: ${opportunity.category}
Subtype: ${opportunity.type || "Opportunity"}
Scope & Notes: ${opportunity.description || "N/A"}
Requirements / Needed Materials: ${opportunity.requirements || "N/A"}
Eligibility Criteria: ${opportunity.eligibility || "N/A"}

=== Candidate Profile / Resume ===
"""
${resumeText.slice(0, 7500)}
"""

Evaluate candidate readiness thoroughly. Return a JSON object with:
1. matchScore: Integer from 0 to 100 representing realistic candidate qualification fit.
2. verdict: Short 2-3 word assessment (e.g. "Outstanding Fit", "Strong Candidate", "Competitive Match", "Stretch Opportunity").
3. strengths: Array of 3-4 specific bullet points highlighting candidate's most compelling qualifications and advantages for this role.
4. gaps: Array of 2-3 specific bullet points highlighting gaps, missing credentials, or unproven areas.
5. recommendations: Array of 3 strategic, actionable advice points for how to stand out, address gaps, and ace the pitch/interview.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["matchScore", "verdict", "strengths", "gaps", "recommendations"]
        }
      }
    });

    const analysis = JSON.parse(response.text?.trim() || "{}");
    return res.json({ analysis, source: "gemini" });
  } catch (error: any) {
    console.error("Match resume error:", error);
    return res.status(500).json({ error: error?.message || "Failed to analyze resume match" });
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
