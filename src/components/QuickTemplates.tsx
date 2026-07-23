/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Briefcase, Rocket, BookOpen, Heart, Sprout, Plus, Check } from 'lucide-react';

interface QuickTemplatesProps {
  onLogOpportunity: (title: string, category: string, type: string, points: number) => void;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  type: string;
  points: number;
}

interface PersonaGroup {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  items: TemplateItem[];
}

const PERSONA_GROUPS: PersonaGroup[] = [
  {
    id: 'career',
    name: 'Job Seeker',
    icon: Briefcase,
    items: [
      { id: 't1', title: 'Applied to a high-priority role', category: 'Career', type: 'Job Application', points: 5 },
      { id: 't2', title: 'Sent personalized message to recruiter', category: 'Career', type: 'Recruiter Message', points: 3 },
      { id: 't3', title: 'Updated CV & LinkedIn profile skills', category: 'Career', type: 'CV Update', points: 3 },
    ]
  },
  {
    id: 'business',
    name: 'Solopreneur & Founder',
    icon: Rocket,
    items: [
      { id: 't4', title: 'Sent 3 cold outreach emails to prospects', category: 'Business', type: 'Cold Email', points: 4 },
      { id: 't5', title: 'Submitted formal proposal to warm lead', category: 'Business', type: 'Proposal Sent', points: 8 },
      { id: 't6', title: 'Conducted product demo call with client', category: 'Business', type: 'Demo Call', points: 10 },
    ]
  },
  {
    id: 'learning',
    name: 'Tech Learner',
    icon: BookOpen,
    items: [
      { id: 't7', title: 'Practiced 45 mins of coding exercises', category: 'Learning', type: 'Practice Coding', points: 3 },
      { id: 't8', title: 'Completed technical course module', category: 'Learning', type: 'Complete Course', points: 10 },
      { id: 't9', title: 'Deployed feature to side project', category: 'Side Projects', type: 'Deploy Feature', points: 8 },
    ]
  },
  {
    id: 'health',
    name: 'Health & Vitality',
    icon: Heart,
    items: [
      { id: 't10', title: 'Completed 30-minute workout session', category: 'Health', type: 'Workout', points: 1 },
      { id: 't11', title: 'Completed daily hydration target', category: 'Health', type: 'Water Goal', points: 1 },
    ]
  },
  {
    id: 'farming',
    name: 'Agri-Project',
    icon: Sprout,
    items: [
      { id: 't12', title: 'Visited farm site & reviewed crop health', category: 'Farming', type: 'Farm Visit', points: 5 },
      { id: 't13', title: 'Saved micro-budget for farm tools', category: 'Farming', type: 'Save for Farm', points: 3 },
    ]
  }
];

export const QuickTemplates: React.FC<QuickTemplatesProps> = ({ onLogOpportunity }) => {
  const [activePersona, setActivePersona] = useState<string>('career');
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());

  const currentGroup = PERSONA_GROUPS.find((g) => g.id === activePersona) || PERSONA_GROUPS[0];

  const handleLogTemplate = (item: TemplateItem) => {
    onLogOpportunity(item.title, item.category, item.type, item.points);
    setLoggedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setLoggedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="p-4 bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-sepia-900 dark:text-cream-100">
          <Sparkles className="w-3.5 h-3.5 text-readflow-gold" />
          <span>1-Click Action Templates</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Fast Outbound</span>
      </div>

      {/* Persona Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PERSONA_GROUPS.map((group) => {
          const Icon = group.icon;
          const isActive = group.id === activePersona;
          return (
            <button
              key={group.id}
              onClick={() => setActivePersona(group.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-readflow-green text-white font-bold shadow-sm'
                  : 'bg-cream-100 dark:bg-sepia-800 text-stone-600 dark:text-cream-300 hover:bg-cream-150'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{group.name}</span>
            </button>
          );
        })}
      </div>

      {/* Template Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {currentGroup.items.map((item) => {
          const isJustLogged = loggedIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => handleLogTemplate(item)}
              disabled={isJustLogged}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer text-xs ${
                isJustLogged
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                  : 'bg-cream-50/50 dark:bg-sepia-950/40 border-cream-200 dark:border-sepia-800 hover:border-readflow-green/40 hover:bg-white dark:hover:bg-sepia-850'
              }`}
            >
              <span className="font-semibold text-sepia-900 dark:text-cream-100 line-clamp-2 leading-tight">
                {item.title}
              </span>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-cream-150/60 dark:border-sepia-800/40">
                <span className="text-[10px] font-mono font-bold text-readflow-gold">
                  +{item.points} pts
                </span>
                {isJustLogged ? (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Logged!
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 group-hover:text-readflow-green flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Log
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
