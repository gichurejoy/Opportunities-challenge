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

// Helper to get dates relative to today (dynamic)
function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

function getRelativeDateOnly(daysOffset: number): string {
  const date = new Date();
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

export const INITIAL_VISIONS: Vision[] = [];

export const INITIAL_PIPELINES: OpportunityPipeline[] = [];

export function generateInitialOpportunities(): Opportunity[] {
  return [];
}

export const DEFAULT_CHECKLIST_HABITS: ChecklistHabit[] = [];

const DEFAULT_NUDGE_CONFIG: NudgeConfig = {
  enabled: true,
  soundEnabled: true,
  browserNotificationsEnabled: false,
  schedules: [
    { id: 'nudge-1', time: '09:00', enabled: true, message: "What's one more opportunity you can create today?" },
    { id: 'nudge-2', time: '14:00', enabled: true, message: "What's one more opportunity you can create today?" },
    { id: 'nudge-3', time: '19:00', enabled: true, message: "What's one more opportunity you can create today?" },
  ],
  history: []
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
        // Purge legacy hardcoded seed data from browser localStorage
        if (Array.isArray(parsed.opportunities)) {
          parsed.opportunities = parsed.opportunities.filter(
            (o: any) => !o.id.startsWith('opp-seed-') && !o.id.startsWith('opp-t')
          );
        }
        if (Array.isArray(parsed.pipelines)) {
          parsed.pipelines = parsed.pipelines.filter(
            (p: any) => !p.id.startsWith('pipe-')
          );
        }
        if (Array.isArray(parsed.visions)) {
          parsed.visions = parsed.visions.filter(
            (v: any) => !v.id.startsWith('vision-')
          );
        }
        if (Array.isArray(parsed.checklistHabits)) {
          parsed.checklistHabits = parsed.checklistHabits.filter(
            (h: any) => !h.id.startsWith('hab-')
          );
        }
        if (parsed.streakStates && (parsed.streakStates.opportunity?.currentStreak === 6 || parsed.streakStates.reading?.currentStreak === 12)) {
          parsed.streakStates = {
            opportunity: { currentStreak: 0, longestStreak: 0 },
            reading: { currentStreak: 0, longestStreak: 0 },
            savings: { currentStreak: 0, longestStreak: 0 },
            fitness: { currentStreak: 0, longestStreak: 0 },
            coding: { currentStreak: 0, longestStreak: 0 },
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }

    // Default clean state for new user
    const defaultState: AppState = {
      opportunities: [],
      pipelines: [],
      scoreConfig: DEFAULT_SCORE_CONFIG,
      visions: [],
      streaks: INITIAL_STREAKS,
      streakStates: {
        opportunity: { currentStreak: 0, longestStreak: 0 },
        reading: { currentStreak: 0, longestStreak: 0 },
        savings: { currentStreak: 0, longestStreak: 0 },
        fitness: { currentStreak: 0, longestStreak: 0 },
        coding: { currentStreak: 0, longestStreak: 0 },
      },
      weeklyTargets: [],
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
