/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScholarshipChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  points: number;
  timestamp: string; // ISO string
  companyOrClient?: string;
  expectedValue?: string; // Expected salary, grant amount, or contract value (e.g. "$120k/yr", "KSh 500k")
  isSystemSuggestion?: boolean;
  isChecklist?: boolean; // True if logged as a daily habit / checklist item
  feedback?: string;
  stage?: string;
  fileName?: string;
  fileData?: string;
  pipelineId?: string;
  linkedVisionId?: string;
  // Separate scholarship fields
  eligibility?: string;
  requirements?: string;
  deadline?: string;
  eligibilityChecklist?: ScholarshipChecklistItem[];
  requirementsChecklist?: ScholarshipChecklistItem[];
}

export function textToChecklistItems(text?: string): ScholarshipChecklistItem[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d+.]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .map((line, index) => ({
      id: `chk-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      text: line,
      completed: false,
    }));
}

export function isChecklistOpportunity(
  opp: Opportunity,
  checklistHabits?: ChecklistHabit[]
): boolean {
  if (opp.isChecklist) return true;
  if (opp.type === 'Daily Habit') return true;
  if (
    checklistHabits &&
    checklistHabits.some(
      (h) =>
        h.title.trim().toLowerCase() === opp.title.trim().toLowerCase() &&
        h.category === opp.category
    )
  ) {
    return true;
  }
  return false;
}

export interface ChecklistHabit {
  id: string;
  title: string;
  category: string;
  type: string;
  points: number;
}

export interface PipelineStageItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface PipelineStage {
  name: string;
  completedAt?: string;
  checklist?: PipelineStageItem[];
}

export interface OpportunityPipeline {
  id: string;
  title: string;
  type: 'Job' | 'Business' | 'Scholarship' | 'Custom' | 'Side Work';
  companyOrClient?: string;
  expectedValue?: string; // Expected salary, grant amount, or deal value
  stages: PipelineStage[];
  currentStageIndex: number;
  status: 'active' | 'won' | 'lost';
  notes: string;
  category: string;
  updatedAt: string;
  createdAt: string;
}

export interface ScoreConfig {
  [category: string]: {
    [type: string]: number;
  };
}

export interface Vision {
  id: string;
  title: string;
  description?: string;
  targetPoints: number;
  completedPoints: number;
  supportingCategories: string[];
  supportingTypes: string[];
  isCompleted: boolean;
}

export interface StreakConfig {
  id: string;
  name: string;
  type: 'opportunity' | 'reading' | 'savings' | 'fitness' | 'coding';
  isActive: boolean;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  shieldActive?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number; // 0-100
}

export interface WeeklyTarget {
  weekStarting: string; // YYYY-MM-DD (usually Sunday)
  targetCount: number;
  completedCount: number;
}

export interface NudgeSchedule {
  id: string;
  time: string; // "HH:MM" 24h format
  enabled: boolean;
  message: string;
}

export interface NudgeLog {
  id: string;
  timestamp: string;
  message: string;
  actionTaken: boolean;
}

export interface NudgeConfig {
  enabled: boolean;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  schedules: NudgeSchedule[];
  history: NudgeLog[];
}

