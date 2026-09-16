/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  feedback?: string;
  stage?: string;
  fileName?: string;
  fileData?: string;
  pipelineId?: string;
  linkedVisionId?: string;
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
  type: 'Job' | 'Business' | 'Scholarship' | 'Custom';
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

