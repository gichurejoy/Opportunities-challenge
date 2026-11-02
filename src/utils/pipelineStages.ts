/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CategoryPipelineTemplate {
  name: string;
  type: 'Job' | 'Business' | 'Scholarship' | 'Custom' | 'Side Work';
  category: string;
  stages: string[];
  terminalWon: string;
  terminalLost: string;
}

export const CATEGORY_PIPELINE_TEMPLATES: Record<string, CategoryPipelineTemplate> = {
  Career: {
    name: 'Job / Fellowship Application',
    type: 'Job',
    category: 'Career',
    stages: ['Sourced', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Won 🎉'],
    terminalWon: 'Won 🎉',
    terminalLost: 'Lost',
  },
  Scholarships: {
    name: 'Scholarship / Grant / Fellowship',
    type: 'Scholarship',
    category: 'Scholarships',
    stages: ['Identified', 'Preparing Application', 'Submitted', 'In Review', 'Interview / Finalist', 'Awarded 🎉'],
    terminalWon: 'Awarded 🎉',
    terminalLost: 'Not Selected',
  },
  Business: {
    name: 'Client / B2B Proposal',
    type: 'Business',
    category: 'Business',
    stages: ['Lead / Inbound', 'Discovery / Pitched', 'Proposal Sent', 'Negotiation', 'Contract Signed', 'Won 🎉'],
    terminalWon: 'Won 🎉',
    terminalLost: 'Lost',
  },
  'Side Work': {
    name: 'Side Work / Freelance Gig',
    type: 'Side Work',
    category: 'Side Work',
    stages: ['Pitch / Inbound', 'Scope & Quote', 'Contract Signed', 'In Progress', 'Delivered & Paid 🎉'],
    terminalWon: 'Delivered & Paid 🎉',
    terminalLost: 'Lost',
  },
  'Side Projects': {
    name: 'Side Project Milestone',
    type: 'Custom',
    category: 'Side Projects',
    stages: ['Ideation', 'In Progress', 'Alpha / MVP', 'Review', 'Launched 🎉'],
    terminalWon: 'Launched 🎉',
    terminalLost: 'Archived',
  },
  Finance: {
    name: 'Financial Opportunity',
    type: 'Custom',
    category: 'Finance',
    stages: ['Identified', 'Assessment', 'In Progress', 'Executed', 'Completed 🎉'],
    terminalWon: 'Completed 🎉',
    terminalLost: 'Dropped',
  },
  Learning: {
    name: 'Learning / Certification Path',
    type: 'Custom',
    category: 'Learning',
    stages: ['Identified', 'Enrolled', 'In Progress', 'Exam / Review', 'Completed 🎉'],
    terminalWon: 'Completed 🎉',
    terminalLost: 'Dropped',
  },
  Farming: {
    name: 'Agricultural Cycle',
    type: 'Custom',
    category: 'Farming',
    stages: ['Planning', 'Land Prep / Sourcing', 'Planting / Active', 'Harvest / Marketing', 'Completed 🎉'],
    terminalWon: 'Completed 🎉',
    terminalLost: 'Lost',
  },
  Health: {
    name: 'Health / Fitness Goal',
    type: 'Custom',
    category: 'Health',
    stages: ['Identified', 'Planning', 'In Progress', 'Milestone Reached', 'Completed 🎉'],
    terminalWon: 'Completed 🎉',
    terminalLost: 'On Hold',
  },
  Personal: {
    name: 'Personal Milestone',
    type: 'Custom',
    category: 'Personal',
    stages: ['Identified', 'Planning', 'In Progress', 'Review', 'Completed 🎉'],
    terminalWon: 'Completed 🎉',
    terminalLost: 'On Hold',
  },
};

export const DEFAULT_PIPELINE_TEMPLATE: CategoryPipelineTemplate = {
  name: 'Standard Opportunity Pipeline',
  type: 'Custom',
  category: 'General',
  stages: ['Identified', 'In Progress', 'Review', 'Completed 🎉'],
  terminalWon: 'Completed 🎉',
  terminalLost: 'Dropped',
};

/**
 * Get the standardized pipeline template for a given category
 */
export function getPipelineTemplateForCategory(category?: string): CategoryPipelineTemplate {
  if (!category) return DEFAULT_PIPELINE_TEMPLATE;
  return CATEGORY_PIPELINE_TEMPLATES[category] || DEFAULT_PIPELINE_TEMPLATE;
}

/**
 * Get all available selectable stages for a category (progression stages + terminal stages)
 */
export function getStagesForCategory(category?: string): string[] {
  const template = getPipelineTemplateForCategory(category);
  const stages = [...template.stages];
  if (!stages.includes(template.terminalLost)) {
    stages.push(template.terminalLost);
  }
  return stages;
}

/**
 * Master list of all valid stages across all categories for global filtering
 */
export const ALL_SYSTEM_STAGES: string[] = Array.from(
  new Set([
    'Sourced',
    'Identified',
    'Applied',
    'Preparing Application',
    'Submitted',
    'Screening',
    'Lead / Inbound',
    'Pitch / Inbound',
    'Discovery / Pitched',
    'Proposal Sent',
    'Scope & Quote',
    'Negotiation',
    'Contract Signed',
    'In Review',
    'Interviewing',
    'Interview / Finalist',
    'In Progress',
    'Offer',
    'Won 🎉',
    'Awarded 🎉',
    'Delivered & Paid 🎉',
    'Launched 🎉',
    'Completed 🎉',
    'Lost',
    'Not Selected',
    'Archived',
    'Dropped',
    'On Hold',
    'Active',
  ])
);

/**
 * Helper to get consistent badge / pill colors for any stage name
 */
export function getStageBadgeStyle(stage?: string): {
  bg: string;
  text: string;
  border: string;
} {
  const s = (stage || '').toLowerCase();

  // Won / Success outcomes
  if (
    s.includes('won') ||
    s.includes('awarded') ||
    s.includes('paid') ||
    s.includes('launched') ||
    s.includes('completed') ||
    s.includes('accepted')
  ) {
    return {
      bg: 'bg-readflow-green/10 dark:bg-readflow-olive/15',
      text: 'text-readflow-green dark:text-readflow-lightgreen',
      border: 'border-readflow-green/20 dark:border-readflow-green/30',
    };
  }

  // Lost / Dropped / Rejected outcomes
  if (
    s.includes('lost') ||
    s.includes('not selected') ||
    s.includes('dropped') ||
    s.includes('rejected') ||
    s.includes('archived')
  ) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-900/40',
    };
  }

  // Active interview / negotiation / offer / final stages
  if (
    s.includes('interview') ||
    s.includes('negotiation') ||
    s.includes('offer') ||
    s.includes('finalist')
  ) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/25',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/40',
    };
  }

  // In progress / submitted / review
  if (
    s.includes('in progress') ||
    s.includes('submitted') ||
    s.includes('review') ||
    s.includes('active') ||
    s.includes('quote') ||
    s.includes('contract')
  ) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/25',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/40',
    };
  }

  // Initial / Sourced stages
  return {
    bg: 'bg-cream-100/70 dark:bg-sepia-850',
    text: 'text-sepia-700 dark:text-cream-200',
    border: 'border-cream-200 dark:border-sepia-800',
  };
}
