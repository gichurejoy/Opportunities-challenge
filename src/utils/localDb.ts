/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Opportunity,
  OpportunityPipeline,
  ScoreConfig,
  Vision,
  StreakConfig,
  StreakState,
  WeeklyTarget,
  ChecklistHabit,
  NudgeConfig
} from '../types';

export interface AppState {
  opportunities: Opportunity[];
  pipelines: OpportunityPipeline[];
  scoreConfig: ScoreConfig;
  visions: Vision[];
  streaks: StreakConfig[];
  streakStates: { [streakId: string]: StreakState };
  weeklyTargets: WeeklyTarget[];
  checklistHabits?: ChecklistHabit[];
  nudgeConfig?: NudgeConfig;
}

// Helper to get dates relative to today (2026-07-09)
function getRelativeDateString(daysOffset: number): string {
  const date = new Date('2026-07-09T10:00:00-07:00');
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

function getRelativeDateOnly(daysOffset: number): string {
  const date = new Date('2026-07-09T10:00:00-07:00');
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Initial default configuration for opportunities points score
export const DEFAULT_SCORE_CONFIG: ScoreConfig = {
  Career: {
    'Job Application': 5,
    'Recruiter Message': 3,
    'Interview': 10,
    'Networking Event': 4,
    'CV Update': 3,
    'Portfolio Update': 5,
  },
  Business: {
    'Cold Email': 4,
    'Proposal Sent': 8,
    'Sales Call': 5,
    'Follow-up': 3,
    'Discovery Call': 5,
    'Demo Call': 10,
    'Partnership Meeting': 8,
    'Client Won': 20,
  },
  Learning: {
    'Read 20 pages': 1,
    'Complete Course': 10,
    'Build Mini Project': 8,
    'Practice Coding': 3,
    'Watch Tutorial': 1,
  },
  Finance: {
    'Saved Money': 3,
    'Invested': 5,
    'Budget Reviewed': 2,
    'Paid Debt': 4,
  },
  Health: {
    'Workout': 1,
    'Walk': 1,
    'Water Goal': 1,
    'Meal Prep': 2,
  },
  Personal: {
    'Read Book': 1,
    'Family Time': 2,
    'Volunteer': 5,
    'Meditation': 1,
  },
  'Side Projects': {
    'Commit Code': 2,
    'Deploy Feature': 8,
    'Design UI': 4,
    'Write Documentation': 3,
    'User Interview': 5,
    'Publish Blog': 4,
  },
  Farming: {
    'Farm Visit': 5,
    'Buy Equipment': 3,
    'Save for Farm': 3,
    'Plant': 5,
    'Harvest': 10,
  }
};

export const INITIAL_STREAKS: StreakConfig[] = [
  { id: 'opportunity', name: '🔥 Opportunity Streak', type: 'opportunity', isActive: true },
  { id: 'reading', name: '📚 Reading Streak', type: 'reading', isActive: true },
  { id: 'savings', name: '💰 Savings Streak', type: 'savings', isActive: true },
  { id: 'fitness', name: '🏃 Fitness Streak', type: 'fitness', isActive: true },
  { id: 'coding', name: '🚀 Coding Streak', type: 'coding', isActive: true },
];

export const INITIAL_VISIONS: Vision[] = [
  {
    id: 'vision-1',
    title: 'Become Senior Software Engineer',
    description: 'Advance technical leadership, contribute to open-source, and launch 3 production-ready web applications.',
    targetPoints: 500,
    completedPoints: 315, // 63%
    supportingCategories: ['Career', 'Learning', 'Side Projects'],
    supportingTypes: ['Job Application', 'Practice Coding', 'Complete Course', 'Build Mini Project', 'Commit Code', 'Portfolio Update'],
    isCompleted: false,
  },
  {
    id: 'vision-2',
    title: 'Establish Organic Farm Project',
    description: 'Secure farm plot, buy necessary planting tools, save for greenhouse equipment, and run first commercial harvest cycle.',
    targetPoints: 200,
    completedPoints: 70, // 35%
    supportingCategories: ['Farming', 'Finance'],
    supportingTypes: ['Farm Visit', 'Save for Farm', 'Buy Equipment', 'Plant', 'Harvest', 'Saved Money'],
    isCompleted: false,
  },
  {
    id: 'vision-3',
    title: 'Build Profitable Solopreneur Business',
    description: 'Create passive income streams by closing 3 design/development agency retainer clients.',
    targetPoints: 300,
    completedPoints: 120, // 40%
    supportingCategories: ['Business', 'Side Projects'],
    supportingTypes: ['Cold Email', 'Proposal Sent', 'Sales Call', 'Client Won', 'Demo Call', 'Follow-up', 'Deploy Feature'],
    isCompleted: false,
  }
];

export const INITIAL_PIPELINES: OpportunityPipeline[] = [
  {
    id: 'pipe-1',
    title: 'Enterprise Client Proposal - Acme Corp',
    type: 'Business',
    stages: [
      { name: 'Created', completedAt: getRelativeDateString(-15) },
      { name: 'Sent', completedAt: getRelativeDateString(-14) },
      { name: 'Waiting', completedAt: getRelativeDateString(-14) },
      { name: 'Meeting Scheduled', completedAt: getRelativeDateString(-8) },
      { name: 'Negotiation' },
      { name: 'Won 🎉' },
    ],
    currentStageIndex: 3,
    status: 'active',
    notes: 'Pitch went great. Followed up on budget expectations. Meeting scheduled to discuss SLA requirements.',
    category: 'Business',
    createdAt: getRelativeDateString(-15),
    updatedAt: getRelativeDateString(-8),
  },
  {
    id: 'pipe-2',
    title: 'Senior Frontend Role - Microsoft',
    type: 'Job',
    stages: [
      { name: 'Applied', completedAt: getRelativeDateString(-22) },
      { name: 'Assessment', completedAt: getRelativeDateString(-15) },
      { name: 'Interview', completedAt: getRelativeDateString(-2) },
      { name: 'Offer' },
    ],
    currentStageIndex: 2,
    status: 'active',
    notes: 'Finished technical design and system interview. Recruiter mentioned positive early feedback, awaiting formal debrief.',
    category: 'Career',
    createdAt: getRelativeDateString(-22),
    updatedAt: getRelativeDateString(-2),
  },
  {
    id: 'pipe-3',
    title: 'East African Agri-Tech Scholarship',
    type: 'Scholarship',
    stages: [
      { name: 'Submitted', completedAt: getRelativeDateString(-30) },
      { name: 'Review', completedAt: getRelativeDateString(-10) },
      { name: 'Interview' },
      { name: 'Accepted' },
    ],
    currentStageIndex: 1,
    status: 'active',
    notes: 'Submitted cover letter focusing on farming automation. Application under committee review.',
    category: 'Career',
    createdAt: getRelativeDateString(-30),
    updatedAt: getRelativeDateString(-10),
  },
];

// Rich set of pre-seeded historical logs for the calendar heatmap
export function generateInitialOpportunities(): Opportunity[] {
  const list: Opportunity[] = [];
  
  // Seed today's opportunities (July 9, 2026)
  list.push(
    { id: 'opp-t1', title: 'Applied to Microsoft', category: 'Career', type: 'Job Application', points: 5, timestamp: getRelativeDateString(0) },
    { id: 'opp-t2', title: 'Messaged CEO regarding integration proposal', category: 'Business', type: 'Cold Email', points: 4, timestamp: getRelativeDateString(0) },
    { id: 'opp-t3', title: 'Published LinkedIn post on building in public', category: 'Side Projects', type: 'Publish Blog', points: 4, timestamp: getRelativeDateString(0) },
    { id: 'opp-t4', title: 'Built responsive landing page demo', category: 'Side Projects', type: 'Build Mini Project', points: 8, timestamp: getRelativeDateString(0) },
  );

  // Seed opportunities for past 12 weeks to populate calendar heatmap
  // Let's create opportunities on random days
  const startDay = -84; // 12 weeks ago
  let count = 100;
  
  // Loop backward and seed random points
  for (let i = startDay; i < 0; i++) {
    const isWeekend = new Date(getRelativeDateString(i)).getDay() % 6 === 0;
    const logChance = isWeekend ? 0.4 : 0.7; // higher chance on weekdays
    
    if (Math.random() < logChance) {
      const numOpps = Math.floor(Math.random() * 3) + 1; // 1 to 3 opportunities
      for (let j = 0; j < numOpps; j++) {
        const categories = Object.keys(DEFAULT_SCORE_CONFIG);
        const category = categories[Math.floor(Math.random() * categories.length)];
        const types = Object.keys(DEFAULT_SCORE_CONFIG[category]);
        const type = types[Math.floor(Math.random() * types.length)];
        const points = DEFAULT_SCORE_CONFIG[category][type] || 1;
        
        list.push({
          id: `opp-seed-${count++}`,
          title: `Completed ${type.toLowerCase()} effort`,
          category,
          type,
          points,
          timestamp: getRelativeDateString(i),
        });
      }
    }
  }

  return list;
}

export const DEFAULT_CHECKLIST_HABITS: ChecklistHabit[] = [
  { id: 'hab-1', title: 'Apply to a job', category: 'Career', type: 'Job Application', points: 5 },
  { id: 'hab-2', title: 'Practice coding', category: 'Learning', type: 'Practice Coding', points: 3 },
  { id: 'hab-3', title: 'Read 20 pages', category: 'Learning', type: 'Read 20 pages', points: 1 },
  { id: 'hab-4', title: 'Do a workout', category: 'Health', type: 'Workout', points: 1 },
  { id: 'hab-5', title: 'Commit code', category: 'Side Projects', type: 'Commit Code', points: 2 },
  { id: 'hab-6', title: 'Send cold outreach email', category: 'Business', type: 'Cold Email', points: 4 },
];

const DEFAULT_NUDGE_CONFIG: NudgeConfig = {
  enabled: true,
  soundEnabled: true,
  browserNotificationsEnabled: false,
  schedules: [
    { id: 'nudge-1', time: '09:00', enabled: true, message: "What's one more opportunity you can create today?" },
    { id: 'nudge-2', time: '14:00', enabled: true, message: "What's one more opportunity you can create today?" },
    { id: 'nudge-3', time: '19:00', enabled: true, message: "What's one more opportunity you can create today?" },
  ],
  history: [
    { id: 'log-1', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), message: "What's one more opportunity you can create today?", actionTaken: true },
    { id: 'log-2', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), message: "What's one more opportunity you can create today?", actionTaken: false },
  ]
};

const STORAGE_KEY = '1000_opportunities_app_state';

export const localDb = {
  loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.checklistHabits) {
          parsed.checklistHabits = DEFAULT_CHECKLIST_HABITS;
        }
        if (!parsed.nudgeConfig) {
          parsed.nudgeConfig = DEFAULT_NUDGE_CONFIG;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }

    // Default pre-seeded state
    const defaultState: AppState = {
      opportunities: generateInitialOpportunities(),
      pipelines: INITIAL_PIPELINES,
      scoreConfig: DEFAULT_SCORE_CONFIG,
      visions: INITIAL_VISIONS,
      streaks: INITIAL_STREAKS,
      streakStates: {
        opportunity: { currentStreak: 6, longestStreak: 15, lastActiveDate: getRelativeDateOnly(0) },
        reading: { currentStreak: 12, longestStreak: 20, lastActiveDate: getRelativeDateOnly(0) },
        savings: { currentStreak: 3, longestStreak: 8, lastActiveDate: getRelativeDateOnly(-1) },
        fitness: { currentStreak: 5, longestStreak: 10, lastActiveDate: getRelativeDateOnly(0) },
        coding: { currentStreak: 8, longestStreak: 12, lastActiveDate: getRelativeDateOnly(0) },
      },
      weeklyTargets: [
        { weekStarting: '2026-07-05', targetCount: 30, completedCount: 22 },
        { weekStarting: '2026-06-28', targetCount: 25, completedCount: 27 },
        { weekStarting: '2026-06-21', targetCount: 25, completedCount: 26 },
      ],
      checklistHabits: DEFAULT_CHECKLIST_HABITS,
      nudgeConfig: DEFAULT_NUDGE_CONFIG,
    };

    this.saveState(defaultState);
    return defaultState;
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  },

  resetState(): AppState {
    localStorage.removeItem(STORAGE_KEY);
    return this.loadState();
  }
};
