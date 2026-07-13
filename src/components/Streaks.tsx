/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StreakConfig, StreakState } from '../types';
import { Flame, BookOpen, Coins, Activity, Code, Settings2, ShieldCheck } from 'lucide-react';

interface StreaksProps {
  streaks: StreakConfig[];
  streakStates: { [streakId: string]: StreakState };
  onToggleStreakActive: (id: string) => void;
}

const STREAK_METADATA: {
  [key: string]: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
  };
} = {
  opportunity: { icon: Flame, color: 'text-readflow-green', bg: 'bg-cream-100/50 dark:bg-sepia-950/30', border: 'border-cream-200 dark:border-sepia-800' },
  reading: { icon: BookOpen, color: 'text-readflow-gold', bg: 'bg-cream-50 dark:bg-sepia-950/20', border: 'border-cream-150 dark:border-sepia-850' },
  savings: { icon: Coins, color: 'text-readflow-olive', bg: 'bg-cream-100/50 dark:bg-sepia-950/30', border: 'border-cream-200 dark:border-sepia-800' },
  fitness: { icon: Activity, color: 'text-sepia-700 dark:text-cream-200', bg: 'bg-cream-50 dark:bg-sepia-950/20', border: 'border-cream-200 dark:border-sepia-800' },
  coding: { icon: Code, color: 'text-readflow-green dark:text-readflow-lightgreen', bg: 'bg-cream-100/50 dark:bg-sepia-950/30', border: 'border-cream-200 dark:border-sepia-800' },
};

export const Streaks: React.FC<StreaksProps> = ({
  streaks,
  streakStates,
  onToggleStreakActive,
}) => {
  return (
    <div id="streaks-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300 font-sans">
      <div>
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-readflow-gold" />
          Active Streaks
        </h2>
        <p className="text-xs text-sepia-400 dark:text-sepia-500 mb-4 font-sans font-medium">
          Maintain your momentum across critical daily disciplines.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-center">
        {streaks.map((streak) => {
          const meta = STREAK_METADATA[streak.id] || STREAK_METADATA.opportunity;
          const Icon = meta.icon;
          const state = streakStates[streak.id] || { currentStreak: 0, longestStreak: 0 };
          const isActive = streak.isActive;

          return (
            <div
              key={streak.id}
              id={`streak-card-${streak.id}`}
              className={`p-3.5 rounded-xl border flex flex-col justify-between h-[120px] transition-all relative group ${
                isActive
                  ? `${meta.bg} ${meta.border} shadow-sm`
                  : 'bg-cream-50/20 dark:bg-sepia-900 border-cream-100 dark:border-sepia-850 opacity-40'
              }`}
            >
              {/* Streak Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? meta.color : 'text-sepia-400'}`} />
                  <span className="text-[10px] font-bold text-sepia-800 dark:text-cream-200 truncate max-w-[80px]">
                    {streak.name.replace(/^[^\s]+\s+/, '')}
                  </span>
                </div>
                
                {/* Active check indicator to toggle */}
                <button
                  id={`streak-toggle-${streak.id}`}
                  onClick={() => onToggleStreakActive(streak.id)}
                  className="p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 transition-all cursor-pointer"
                  title={isActive ? 'Deactivate tracking' : 'Activate tracking'}
                >
                  <Settings2 className="w-3 h-3" />
                </button>
              </div>

              {/* Streak Stat */}
              <div className="flex items-baseline gap-1 mt-2">
                <span className={`text-2xl font-black font-mono leading-none ${isActive ? 'text-sepia-900 dark:text-cream-50' : 'text-sepia-400'}`}>
                  {state.currentStreak}
                </span>
                <span className="text-[9px] text-sepia-400 font-bold uppercase font-sans">days</span>
              </div>

              {/* Record tracking */}
              <div className="flex items-center justify-between text-[9px] text-sepia-400 mt-2 border-t border-cream-150 dark:border-sepia-850 pt-2">
                <span>Longest record:</span>
                <span className="font-mono font-bold text-sepia-600 dark:text-cream-200">
                  {state.longestStreak} days
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-sepia-400" />
        Streaks increment automatically upon logging corresponding actions.
      </div>
    </div>
  );
};
