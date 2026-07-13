/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ChecklistHabit, 
  Opportunity, 
  ScoreConfig, 
  Vision 
} from '../types';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  HelpCircle,
  Clock,
  ListChecks,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';

interface ChecklistGridProps {
  checklistHabits: ChecklistHabit[];
  opportunities: Opportunity[];
  onAddChecklistHabit: (habit: Omit<ChecklistHabit, 'id'>) => void;
  onDeleteChecklistHabit: (id: string) => void;
  onLogOpportunity: (opportunity: Omit<Opportunity, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  onDeleteOpportunity: (id: string) => void;
  visions: Vision[];
}

export const ChecklistGrid: React.FC<ChecklistGridProps> = ({
  checklistHabits,
  opportunities,
  onAddChecklistHabit,
  onDeleteChecklistHabit,
  onLogOpportunity,
  onDeleteOpportunity,
  visions,
}) => {
  const [resolutionDays, setResolutionDays] = useState<7 | 14 | 30>(14);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Career');
  const [newHabitPoints, setNewHabitPoints] = useState(3);
  const [linkToVisionId, setLinkToVisionId] = useState('');

  // Generate date list from today backwards
  const dates = useMemo(() => {
    const list: { dateStr: string; label: string; subLabel: string; isToday: boolean }[] = [];
    const today = new Date();
    
    for (let i = resolutionDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = i === 0;
      
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      list.push({
        dateStr,
        label: `${dayName} ${dayNum}`,
        subLabel: monthName,
        isToday,
      });
    }
    return list;
  }, [resolutionDays]);

  // Helper to check if a specific habit was logged on a specific date
  const getLogForHabitAndDate = (habit: ChecklistHabit, dateStr: string): Opportunity | undefined => {
    return opportunities.find((opp) => {
      const oppDateStr = opp.timestamp.split('T')[0];
      return (
        oppDateStr === dateStr &&
        opp.title.toLowerCase() === habit.title.toLowerCase() &&
        opp.category === habit.category
      );
    });
  };

  // Toggle habit log on a specific date
  const handleToggleHabitOnDate = (habit: ChecklistHabit, dateStr: string) => {
    const existingLog = getLogForHabitAndDate(habit, dateStr);
    
    if (existingLog) {
      onDeleteOpportunity(existingLog.id);
    } else {
      // Find a matching vision if one is selected or auto-linkable
      const autoVision = visions.find(v => 
        v.supportingCategories.includes(habit.category)
      );

      // Log opportunity with custom timestamp for that specific day
      // Use middle of the day (12:00) to avoid timezone shifts near boundaries
      const customTimestamp = `${dateStr}T12:00:00.000Z`;
      onLogOpportunity({
        title: habit.title,
        category: habit.category,
        type: habit.type || 'Daily Habit',
        points: habit.points,
        linkedVisionId: autoVision ? autoVision.id : undefined,
        timestamp: customTimestamp,
      });
    }
  };

  const handleCreateHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    onAddChecklistHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      type: 'Daily Habit',
      points: newHabitPoints,
    });

    setNewHabitTitle('');
  };

  // Compute stats for checklist habits
  const habitsStats = useMemo(() => {
    let totalPointsEarned = 0;
    let completedCount = 0;
    const totalPotentialSlots = checklistHabits.length * dates.length;

    checklistHabits.forEach(habit => {
      dates.forEach(d => {
        const log = getLogForHabitAndDate(habit, d.dateStr);
        if (log) {
          totalPointsEarned += habit.points;
          completedCount++;
        }
      });
    });

    const completionRate = totalPotentialSlots > 0 
      ? Math.round((completedCount / totalPotentialSlots) * 100) 
      : 0;

    return {
      totalPointsEarned,
      completedCount,
      completionRate,
    };
  }, [checklistHabits, dates, opportunities]);

  return (
    <div id="checklist-grid-view" className="space-y-6 animate-none">
      
      {/* View Header */}
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-readflow-green dark:text-readflow-lightgreen" />
            Daily Checklist Grid
          </h1>
          <p className="text-xs text-sepia-500 dark:text-sepia-400 mt-1 max-w-xl font-sans">
            Track and toggle consistency across key disciplines over time. Check boxes on any day in the past to quickly retroactively log or remove opportunity scores!
          </p>
        </div>

        {/* Resolution selector */}
        <div className="flex items-center gap-1.5 bg-cream-50 dark:bg-sepia-850 p-1 rounded-xl border border-cream-150 dark:border-sepia-800 self-start md:self-auto">
          <button
            onClick={() => setResolutionDays(7)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              resolutionDays === 7
                ? 'bg-readflow-green text-cream-50 shadow-sm'
                : 'text-sepia-400 hover:text-sepia-600 dark:text-sepia-300'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setResolutionDays(14)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              resolutionDays === 14
                ? 'bg-readflow-green text-cream-50 shadow-sm'
                : 'text-sepia-400 hover:text-sepia-600 dark:text-sepia-300'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setResolutionDays(30)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              resolutionDays === 30
                ? 'bg-readflow-green text-cream-50 shadow-sm'
                : 'text-sepia-400 hover:text-sepia-600 dark:text-sepia-300'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#f0f4f0] dark:bg-[#1a2b1d] rounded-xl text-readflow-green dark:text-readflow-lightgreen shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500 block">Checklist Points Earned</span>
            <span className="text-2xl font-mono font-bold text-sepia-900 dark:text-cream-50 mt-0.5 block">
              +{habitsStats.totalPointsEarned} <span className="text-xs text-sepia-400 font-sans">pts</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#fbf5e6] dark:bg-[#2b2518] rounded-xl text-readflow-gold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500 block">Total Completions</span>
            <span className="text-2xl font-mono font-bold text-sepia-900 dark:text-cream-50 mt-0.5 block">
              {habitsStats.completedCount} <span className="text-xs text-sepia-400 font-sans">logs</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#faf0f5] dark:bg-[#2b1b24] rounded-xl text-pink-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500 block">Compliance Rate</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-mono font-bold text-sepia-900 dark:text-cream-50">
                {habitsStats.completionRate}%
              </span>
              <span className="text-xs font-sans text-sepia-450 dark:text-sepia-400">
                of potential target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Habit Matrix Grid */}
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-readflow-gold" />
            Habit Consistency Matrix
          </h2>
          <span className="text-[10px] font-mono font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Interactive Grid Toggle
          </span>
        </div>

        {checklistHabits.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-cream-200 dark:border-sepia-800 rounded-2xl">
            <ListChecks className="w-10 h-10 text-sepia-300 dark:text-sepia-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-sepia-700 dark:text-cream-200">No daily habits defined yet</p>
            <p className="text-xs text-sepia-450 dark:text-sepia-450 mt-1 max-w-sm mx-auto">
              Add goals like "Apply to 1 job daily" or "Walk 10k steps" below to generate your habits grid!
            </p>
          </div>
        ) : (
          /* Grid table with custom scrollbar */
          <div className="overflow-x-auto border border-cream-150 dark:border-sepia-800 rounded-xl bg-cream-50/10 dark:bg-sepia-950/20 max-w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-cream-150 dark:border-sepia-800 bg-cream-50/50 dark:bg-sepia-900/60 text-[10px] uppercase font-mono font-bold text-sepia-450 dark:text-sepia-500">
                  <th className="p-4 w-60 sticky left-0 bg-white dark:bg-sepia-900 shadow-[2px_0_5px_rgba(0,0,0,0.03)] z-10">Daily Habit</th>
                  {dates.map((d) => (
                    <th key={d.dateStr} className={`p-3 text-center min-w-[60px] ${d.isToday ? 'bg-readflow-green/5 text-readflow-green dark:text-readflow-lightgreen font-black' : ''}`}>
                      <div>{d.label}</div>
                      <div className="text-[8px] font-normal tracking-normal text-sepia-400 dark:text-sepia-500">{d.subLabel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-150 dark:divide-sepia-800">
                {checklistHabits.map((habit) => {
                  const meta = CATEGORY_METADATA[habit.category] || CATEGORY_METADATA.Career;
                  const Icon = meta.icon;
                  
                  // Calculate row-specific stats
                  let habitTotalCompletions = 0;
                  dates.forEach(d => {
                    if (getLogForHabitAndDate(habit, d.dateStr)) {
                      habitTotalCompletions++;
                    }
                  });
                  const habitCompliance = Math.round((habitTotalCompletions / dates.length) * 100);

                  return (
                    <tr key={habit.id} className="hover:bg-cream-50/20 dark:hover:bg-sepia-850/15 group">
                      {/* Habit Name column with category icon */}
                      <td className="p-4 font-sans sticky left-0 bg-white dark:bg-sepia-900 shadow-[2px_0_5px_rgba(0,0,0,0.03)] z-10">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="p-1.5 rounded-lg bg-white dark:bg-sepia-850 border border-cream-150 dark:border-sepia-800">
                            <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-sepia-800 dark:text-cream-100 truncate max-w-[150px] sm:max-w-[180px]" title={habit.title}>
                              {habit.title}
                            </div>
                            <div className="text-[9px] font-mono text-sepia-450 dark:text-sepia-500 mt-0.5 flex items-center gap-1.5">
                              <span>+{habit.points} pts</span>
                              <span className="opacity-40">•</span>
                              <span className="text-readflow-green dark:text-readflow-lightgreen font-bold">{habitCompliance}% compliance</span>
                            </div>
                          </div>
                          
                          {/* Trash button hidden until row hover */}
                          <button
                            onClick={() => onDeleteChecklistHabit(habit.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 text-sepia-300 hover:text-red-500 p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                            title="Remove daily habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Interactive Day checkboxes */}
                      {dates.map((d) => {
                        const loggedOpp = getLogForHabitAndDate(habit, d.dateStr);
                        const isCompleted = !!loggedOpp;
                        return (
                          <td key={d.dateStr} className={`p-3 text-center transition-all ${d.isToday ? 'bg-readflow-green/5' : ''}`}>
                            <div className="flex items-center justify-center">
                              <label className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-cream-100 dark:hover:bg-sepia-800 cursor-pointer transition-all">
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => handleToggleHabitOnDate(habit, d.dateStr)}
                                  className="sr-only peer"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-readflow-green dark:bg-readflow-lightgreen border-readflow-green dark:border-readflow-lightgreen scale-110 text-white shadow-sm'
                                    : 'border-cream-300 dark:border-sepia-750 bg-white dark:bg-sepia-900 group-hover:border-cream-400'
                                }`}>
                                  {isCompleted && (
                                    <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </label>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Habit Form */}
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm">
        <h3 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen" />
          Add New Checklist Goal
        </h3>
        <p className="text-xs text-sepia-450 dark:text-sepia-400 mb-4 font-sans">
          Create customized recurring daily tasks. When completed, they will automatically award points and increment your supporting Vision goals.
        </p>

        <form onSubmit={handleCreateHabitSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5 font-sans">
              Habit Action / Goal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct daily code push, review 5 business portfolios, etc."
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5 font-sans">
              Category Focus
            </label>
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5 font-sans">
              Points Weighted
            </label>
            <select
              value={newHabitPoints}
              onChange={(e) => setNewHabitPoints(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-mono font-bold text-center"
            >
              <option value={1}>+1 pt</option>
              <option value={2}>+2 pts</option>
              <option value={3}>+3 pts</option>
              <option value={5}>+5 pts</option>
              <option value={10}>+10 pts</option>
              <option value={15}>+15 pts</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-readflow-green dark:bg-readflow-olive hover:bg-readflow-green/95 dark:hover:bg-readflow-olive/95 text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
