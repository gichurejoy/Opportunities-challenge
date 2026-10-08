/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CategoryFieldConfig {
  actionLabel: string;
  actionPlaceholder: string;
  entityLabel: string;
  entityPlaceholder: string;
  valueLabel: string;
  valuePlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
}

export const CATEGORY_FIELD_CONFIGS: Record<string, CategoryFieldConfig> = {
  Career: {
    actionLabel: 'What career action did you take?',
    actionPlaceholder: 'e.g. Submitted application for Senior Frontend role, messaged recruiter on LinkedIn...',
    entityLabel: 'Target Company / Employer (Optional)',
    entityPlaceholder: 'e.g. Google, Stripe, Local Startup',
    valueLabel: 'Target Salary / Compensation (Optional)',
    valuePlaceholder: 'e.g. $120k / yr, KSh 250k / mo',
    detailsLabel: 'Job Description & Role Requirements (Optional)',
    detailsPlaceholder: 'e.g. Key tech stack, role requirements, recruiter notes or link...',
  },
  Scholarships: {
    actionLabel: 'What scholarship action did you take?',
    actionPlaceholder: 'e.g. Submitted essay for Chevening / DAAD scholarship, requested recommendation letter...',
    entityLabel: 'University / Scholarship Provider (Optional)',
    entityPlaceholder: 'e.g. Oxford, Fulbright, Erasmus Mundus, Mastercard Foundation',
    valueLabel: 'Award Amount / Grant Value (Optional)',
    valuePlaceholder: 'e.g. Full Tuition + $2,000/mo stipend, $25,000 grant',
    detailsLabel: 'Additional Notes & Essay Prompts (Optional)',
    detailsPlaceholder: 'e.g. Essay prompt, application link, notes or referee contacts...',
  },
  'Side Work': {
    actionLabel: 'What side work or freelance gig did you complete?',
    actionPlaceholder: 'e.g. Delivered freelance client landing page, completed consulting session, submitted bug fix...',
    entityLabel: 'Client / Platform / Buyer (Optional)',
    entityPlaceholder: 'e.g. Upwork, Fiverr, Acme Client, Direct Referral',
    valueLabel: 'Earnings / Hourly Rate / Contract Value (Optional)',
    valuePlaceholder: 'e.g. $350 gig, $50/hr, KSh 25,000',
    detailsLabel: 'Deliverables, Scope of Work & Notes (Optional)',
    detailsPlaceholder: 'e.g. Scope delivered, client feedback, milestones completed, hours logged...',
  },
  Farming: {
    actionLabel: 'What farming activity did you complete?',
    actionPlaceholder: 'e.g. Planted 2 acres of maize, sprayed pesticide on tomato plot, purchased fertilizer...',
    entityLabel: 'Farm / Plot / Supplier (Optional)',
    entityPlaceholder: 'e.g. North Plot, Green Valley Farm, Local Agrovet',
    valueLabel: 'Expected Yield / Market Value (Optional)',
    valuePlaceholder: 'e.g. 50 bags (~$2,500), 200kg harvest, KSh 150,000',
    detailsLabel: 'Field Notes, Crop/Livestock & Inputs (Optional)',
    detailsPlaceholder: 'e.g. Crop variety (H614), acreage, fertilizer type (DAP 50kg), weather conditions...',
  },
  Business: {
    actionLabel: 'What business development step did you take?',
    actionPlaceholder: 'e.g. Sent B2B proposal for branding redesign, closed Q3 retainer contract...',
    entityLabel: 'Target Client / Partner Company (Optional)',
    entityPlaceholder: 'e.g. Apex Logistics, Vertex Media, Local Retailer',
    valueLabel: 'Contract Value / Deal Size (Optional)',
    valuePlaceholder: 'e.g. $5,000 project, $1,200/mo retainer, KSh 300k',
    detailsLabel: 'Scope of Work & Proposal Notes (Optional)',
    detailsPlaceholder: 'e.g. Deliverables, client pain points, timeline, payment milestones...',
  },
  Learning: {
    actionLabel: 'What did you learn or study today?',
    actionPlaceholder: 'e.g. Completed Chapter 4 of System Design, finished React 19 course module...',
    entityLabel: 'Course / Platform / Institution (Optional)',
    entityPlaceholder: 'e.g. Coursera, MIT OpenCourseWare, Udemy, O\'Reilly',
    valueLabel: 'Hours Studied / Target Certification (Optional)',
    valuePlaceholder: 'e.g. 2.5 hours, AWS Solutions Architect, HSK Level 3',
    detailsLabel: 'Key Takeaways, Topics & Code Notes (Optional)',
    detailsPlaceholder: 'e.g. Main concepts mastered, tricky problems solved, project ideas...',
  },
  Finance: {
    actionLabel: 'What financial action or milestone did you log?',
    actionPlaceholder: 'e.g. Transferred $500 to index fund, balanced monthly budget, paid off debt...',
    entityLabel: 'Account / Platform / Asset (Optional)',
    entityPlaceholder: 'e.g. Vanguard S&P 500, High-Yield Savings, Treasury Bills, M-Pesa Lock',
    valueLabel: 'Amount Saved / Invested / Paid (Optional)',
    valuePlaceholder: 'e.g. $500, KSh 50,000, 10% of monthly income',
    detailsLabel: 'Financial Goal & Strategy Notes (Optional)',
    detailsPlaceholder: 'e.g. Target return rate, allocation strategy, spending cut notes...',
  },
  Health: {
    actionLabel: 'What health or fitness action did you complete?',
    actionPlaceholder: 'e.g. 5km morning run, completed heavy leg day workout, drank 3L water...',
    entityLabel: 'Location / Routine / Facility (Optional)',
    entityPlaceholder: 'e.g. PureGym, Outdoor Trail, Home Gym, Swimming Pool',
    valueLabel: 'Target Metric / Distance / Duration (Optional)',
    valuePlaceholder: 'e.g. 5.2 km, 45 mins, 2,200 kcal, 8 hrs sleep',
    detailsLabel: 'Workout Routine, Sets/Reps & Wellness (Optional)',
    detailsPlaceholder: 'e.g. Squats 4x8 @ 100kg, heart rate avg 145bpm, felt energized...',
  },
  Personal: {
    actionLabel: 'What personal habit or milestone did you practice?',
    actionPlaceholder: 'e.g. 20 min morning meditation, volunteered at community pantry, family dinner...',
    entityLabel: 'Person / Community / Cause (Optional)',
    entityPlaceholder: 'e.g. Family, Community Food Bank, Book Club, Mentee',
    valueLabel: 'Time Dedicated / Frequency (Optional)',
    valuePlaceholder: 'e.g. 1.5 hours, Weekly habit, 30 mins daily',
    detailsLabel: 'Reflections & Gratitude Notes (Optional)',
    detailsPlaceholder: 'e.g. What went well, mood rating, reflections or lessons learned...',
  },
  'Side Projects': {
    actionLabel: 'What did you build or ship today?',
    actionPlaceholder: 'e.g. Implemented OAuth login, shipped v1 landing page, wrote API docs...',
    entityLabel: 'Project Name / Repository / App (Optional)',
    entityPlaceholder: 'e.g. AI Prompt Tool, iOS Expense Tracker, Portfolio site',
    valueLabel: 'Milestone / Target Metric (Optional)',
    valuePlaceholder: 'e.g. v1.0 Launch, 100 beta users, 1,000 lines of code',
    detailsLabel: 'Tech Stack, Features & Next Steps (Optional)',
    detailsPlaceholder: 'e.g. Next.js 15, Tailwind, Supabase; next task: stripe webhook...',
  },
};

const DEFAULT_CATEGORY_FIELD_CONFIG: CategoryFieldConfig = {
  actionLabel: 'What did you do? (We\'ll auto-assign category weights)',
  actionPlaceholder: 'e.g., Logged meaningful effort towards this goal...',
  entityLabel: 'Target Organization / Partner (Optional)',
  entityPlaceholder: 'e.g. Organization, Client, or Facility name',
  valueLabel: 'Expected Value / Target Metric (Optional)',
  valuePlaceholder: 'e.g. $1,000, 5 hours, target milestone',
  detailsLabel: 'Details & Notes (Optional)',
  detailsPlaceholder: 'e.g. Add notes, requirements, or next steps...',
};

export function getCategoryFieldConfig(category: string): CategoryFieldConfig {
  return CATEGORY_FIELD_CONFIGS[category] || {
    ...DEFAULT_CATEGORY_FIELD_CONFIG,
    actionLabel: `What did you do in ${category}?`,
  };
}
