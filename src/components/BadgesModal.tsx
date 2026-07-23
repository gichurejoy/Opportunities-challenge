/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Award, Flame, Target, Star, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { Opportunity, OpportunityPipeline } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  pipelines: OpportunityPipeline[];
  currentStreak: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.FC<{ className?: string }>;
  isUnlocked: boolean;
  progress: number; // 0 - 100
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  pipelines,
  currentStreak,
}) => {
  if (!isOpen) return null;

  const totalOpps = opportunities.length;
  const totalPoints = opportunities.reduce((sum, o) => sum + o.points, 0);
  const wonDeals = pipelines.filter((p) => p.status === 'won').length;
  const learningOpps = opportunities.filter((o) => o.category === 'Learning').length;

  const BADGES: BadgeItem[] = [
    {
      id: 'b1',
      title: 'First Step',
      description: 'Log your very first opportunity',
      category: 'Milestone',
      icon: Star,
      isUnlocked: totalOpps >= 1,
      progress: Math.min(100, (totalOpps / 1) * 100),
    },
    {
      id: 'b2',
      title: 'Century Club',
      description: 'Accumulate 100 momentum points',
      category: 'Points',
      icon: Trophy,
      isUnlocked: totalPoints >= 100,
      progress: Math.min(100, (totalPoints / 100) * 100),
    },
    {
      id: 'b3',
      title: 'Streak Master',
      description: 'Maintain a 7-day continuous logging streak',
      category: 'Streaks',
      icon: Flame,
      isUnlocked: currentStreak >= 7,
      progress: Math.min(100, (currentStreak / 7) * 100),
    },
    {
      id: 'b4',
      title: 'Deal Closer',
      description: 'Mark 1 Opportunity Pipeline stage as Won 🎉',
      category: 'Pipeline',
      icon: Award,
      isUnlocked: wonDeals >= 1,
      progress: Math.min(100, (wonDeals / 1) * 100),
    },
    {
      id: 'b5',
      title: 'Knowledge Builder',
      description: 'Log 10 learning or skill acquisition efforts',
      category: 'Learning',
      icon: Sparkles,
      isUnlocked: learningOpps >= 10,
      progress: Math.min(100, (learningOpps / 10) * 100),
    },
    {
      id: 'b6',
      title: 'Halfway Legend',
      description: 'Reach 500 logged opportunities',
      category: 'Milestone',
      icon: Target,
      isUnlocked: totalOpps >= 500,
      progress: Math.min(100, (totalOpps / 500) * 100),
    },
    {
      id: 'b7',
      title: '1,000 Champion',
      description: 'Complete the entire 1,000 Opportunities Challenge!',
      category: 'Grand',
      icon: CrownIcon,
      isUnlocked: totalOpps >= 1000,
      progress: Math.min(100, (totalOpps / 1000) * 100),
    },
  ];

  const unlockedCount = BADGES.filter((b) => b.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-cream-50 dark:bg-sepia-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-readflow-green via-readflow-olive to-stone-900 text-cream-50 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-cream-200/80 hover:text-cream-50 bg-black/10 hover:bg-black/25 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-mono font-bold tracking-wider text-readflow-gold uppercase mb-2">
            <Trophy className="w-3.5 h-3.5 text-readflow-gold" />
            Gamification Achievements
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-cream-50">
            Milestone Badges ({unlockedCount} / {BADGES.length} Unlocked)
          </h3>
          <p className="text-xs text-cream-200/90 mt-1 font-light">
            Keep creating opportunities to unlock visual achievement badges and track your progress.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BADGES.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex gap-3.5 items-start ${
                  badge.isUnlocked
                    ? 'bg-white dark:bg-sepia-950 border-readflow-gold/40 shadow-sm'
                    : 'bg-cream-100/60 dark:bg-sepia-950/30 border-cream-200/70 dark:border-sepia-800/40 opacity-70'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    badge.isUnlocked
                      ? 'bg-gradient-to-br from-readflow-green to-readflow-olive text-cream-50 shadow-md'
                      : 'bg-cream-200 dark:bg-sepia-800 text-stone-400'
                  }`}
                >
                  {badge.isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-serif font-bold text-sepia-900 dark:text-cream-100">
                      {badge.title}
                    </h4>
                    {badge.isUnlocked ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400 font-bold">
                        {Math.round(badge.progress)}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-stone-500 dark:text-cream-300 font-light leading-snug">
                    {badge.description}
                  </p>

                  {/* Progress bar */}
                  {!badge.isUnlocked && (
                    <div className="w-full h-1.5 bg-cream-200 dark:bg-sepia-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-readflow-gold transition-all duration-300"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

const CrownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);
