# 1,000 Opportunities Challenge



> **Core Philosophy:** Your life changes when the number of proactive opportunities you create exceeds the number you wait for.

A productivity tracker that empowers you to log **1,000 high-leverage outbound actions** — job applications, cold emails, sales proposals, code deployments, learning milestones, investment deposits — and watch your momentum compound over time.

---

## Features

- 🔥 **Opportunity Logger** — Quickly log any proactive action with category, type, description, and expected value (salary / grant / deal amount)
- 💰 **Expected Value Tracking** — Attach salary ranges, grant amounts, or contract values to any opportunity or pipeline item
- 🗓️ **Heatmap** — GitHub-style activity heatmap of your daily logs
- 📊 **Analytics** — Live funnel conversion metrics (Career, Business, Learning) calculated from your real data
- 🎯 **Visions Roadmap** — Set and track long-term goals linked to your opportunity logs
- 🚀 **Pipeline Tracker** — Kanban-style stages for active opportunities (proposals, job applications, scholarships)
- 🔔 **Daily Nudge Reminders** — Browser notifications to keep your momentum going
- 📅 **Weekly Review** — Dynamically computed weekly and monthly statistics
- ✅ **Habit Checklist** — Daily discipline tracker (fitness, reading, coding)
- 🏅 **Streaks** — Maintain multi-discipline streaks across career, fitness, savings, and coding
- 💡 **AI Catalyst (One More)** — Gemini-powered personalized action suggestions based on your visions
- 🗄️ **Data Vault** — Full export/import of your database as JSON or CSV spreadsheet
- 🌙 **Dark / Light Mode** — Full theme support

---

## Run Locally

**Prerequisites:** Node.js v18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Gemini API key in `.env` (or `.env.local`):
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Styling:** Tailwind CSS with custom design tokens
- **AI:** Google Gemini API (for opportunity suggestions)
- **Storage:** Browser `localStorage` (no backend required)
- **Animations:** Framer Motion

---

## Project Structure

```
src/
├── components/          # All UI panels (Logger, Heatmap, Pipeline, Visions...)
│   └── FormattedText.tsx # Markdown-like text renderer (bold, italic, links, lists)
├── utils/
│   └── localDb.ts       # localStorage persistence layer
├── types.ts             # TypeScript type definitions
└── App.tsx              # Main application state & orchestration
```
