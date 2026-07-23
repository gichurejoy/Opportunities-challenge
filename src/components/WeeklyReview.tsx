/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Opportunity, WeeklyTarget } from '../types';
import { Sparkles, Calendar, Award, ChevronLeft, ChevronRight, BarChart2, Edit2, Check } from 'lucide-react';

interface WeeklyReviewProps {
  opportunities: Opportunity[];
  weeklyTargets: WeeklyTarget[];
  onUpdateWeeklyTarget: (weekStarting: string, targetCount: number) => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({
  opportunities,
  weeklyTargets,
  onUpdateWeeklyTarget,
}) => {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(0); // Default to 0 (This Week)
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = current month, 1 = last month
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTargetInput, setTempTargetInput] = useState<string>('');

  // Dynamically generate the 4 week ranges relative to current system date
  const weeks = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - currentDay);
    currentSunday.setHours(0, 0, 0, 0);

    const list = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(currentSunday);
      weekStart.setDate(currentSunday.getDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const startStr = weekStart.toISOString().split('T')[0];
      const labelText =
        i === 0
          ? `This Week (${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`
          : i === 1
          ? `Last Week (${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`
          : `${i} Weeks Ago (${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;

      list.push({
        date: startStr,
        label: labelText,
        startOfWeek: weekStart,
        endOfWeek: weekEnd,
      });
    }
    return list;
  }, []);

  const currentWeek = weeks[selectedWeekIdx] || weeks[0];

  // Compute stats for selected week dynamically from actual opportunities
  const weeklyStats = useMemo(() => {
    const weekLogs = opportunities.filter((o) => {
      const d = new Date(o.timestamp);
      return d >= currentWeek.startOfWeek && d <= currentWeek.endOfWeek;
    });

    const categoryCounts: { [cat: string]: number } = {};
    weekLogs.forEach((o) => {
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });

    return {
      total: weekLogs.length,
      categories: categoryCounts,
    };
  }, [opportunities, currentWeek]);

  // Find target from props or default to 30
  const activeTarget = useMemo(() => {
    return (
      weeklyTargets.find((t) => t.weekStarting === currentWeek.date) || {
        weekStarting: currentWeek.date,
        targetCount: 30,
        completedCount: weeklyStats.total,
      }
    );
  }, [weeklyTargets, currentWeek.date, weeklyStats.total]);

  const progressPercent = useMemo(() => {
    if (activeTarget.targetCount <= 0) return 0;
    return Math.min(100, Math.round((weeklyStats.total / activeTarget.targetCount) * 100));
  }, [weeklyStats.total, activeTarget.targetCount]);

  const handleStartEditTarget = () => {
    setTempTargetInput(String(activeTarget.targetCount));
    setIsEditingTarget(true);
  };

  const handleSaveTarget = () => {
    const num = parseInt(tempTargetInput, 10);
    if (!isNaN(num) && num > 0) {
      onUpdateWeeklyTarget(currentWeek.date, num);
    }
    setIsEditingTarget(false);
  };

  // Dynamically compute monthly stats from actual opportunities
  const monthlyStats = useMemo(() => {
    const targetMonthDate = new Date();
    targetMonthDate.setMonth(targetMonthDate.getMonth() - selectedMonthOffset);
    
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();
    const monthName = targetMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const monthLogs = opportunities.filter((o) => {
      const d = new Date(o.timestamp);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const catSummary: { [cat: string]: number } = {};
    monthLogs.forEach((o) => {
      catSummary[o.category] = (catSummary[o.category] || 0) + 1;
    });

    const details = Object.entries(catSummary).map(
      ([cat, count]) => `${count} ${cat} Opportunity ${count === 1 ? 'Log' : 'Logs'}`
    );

    return {
      name: monthName,
      total: monthLogs.length,
      details: details.length > 0 ? details : ['No logged opportunities for this month.'],
    };
  }, [opportunities, selectedMonthOffset]);

  return (
    <div id="weekly-review-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300 font-sans">
      <div>
        {/* Toggle tabs */}
        <div className="flex border-b border-cream-150 dark:border-sepia-850 mb-4 text-xs font-semibold">
          <button
            id="tab-weekly-review"
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'weekly'
                ? 'border-readflow-green text-sepia-800 dark:text-cream-50 font-bold'
                : 'border-transparent text-sepia-400 dark:text-sepia-500 hover:text-sepia-650'
            }`}
          >
            Weekly Review
          </button>
          <button
            id="tab-monthly-reflection"
            onClick={() => setActiveTab('monthly')}
            className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'monthly'
                ? 'border-readflow-green text-sepia-800 dark:text-cream-50 font-bold'
                : 'border-transparent text-sepia-400 dark:text-sepia-500 hover:text-sepia-650'
            }`}
          >
            Monthly Reflection
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {activeTab === 'weekly' ? (
          <div className="space-y-4">
            {/* Week Switcher */}
            <div className="flex items-center justify-between border-b border-cream-100 dark:border-sepia-850 pb-2.5">
              <button
                id="btn-prev-week"
                disabled={selectedWeekIdx >= weeks.length - 1}
                onClick={() => setSelectedWeekIdx((prev) => Math.min(weeks.length - 1, prev + 1))}
                className="p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all text-sepia-400 hover:text-sepia-750 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-sepia-805 dark:text-cream-200 flex items-center gap-1 font-mono uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-readflow-gold" />
                {currentWeek.label}
              </span>
              <button
                id="btn-next-week"
                disabled={selectedWeekIdx <= 0}
                onClick={() => setSelectedWeekIdx((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all text-sepia-400 hover:text-sepia-750 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Target Display and Ring */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50 relative overflow-hidden">
              {/* Circular SVG Progress Ring */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center z-10">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-cream-150 dark:stroke-sepia-850 fill-transparent"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-readflow-green dark:stroke-readflow-lightgreen fill-transparent transition-all duration-500"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercent / 100)}`}
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-bold text-sepia-800 dark:text-cream-100">
                  {progressPercent}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-sepia-400 dark:text-sepia-550 font-bold uppercase tracking-wider">Target Objective</p>
                
                {isEditingTarget ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      id="weekly-target-input"
                      type="number"
                      min="1"
                      max="200"
                      value={tempTargetInput}
                      onChange={(e) => setTempTargetInput(e.target.value)}
                      className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold rounded border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none"
                    />
                    <button
                      id="save-weekly-target-btn"
                      onClick={handleSaveTarget}
                      className="p-1 rounded bg-readflow-green text-white cursor-pointer hover:bg-readflow-olive transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <h3 className="text-base font-serif font-black text-sepia-800 dark:text-cream-50 leading-none">
                      {weeklyStats.total} <span className="text-xs font-normal text-sepia-500 dark:text-sepia-400 font-sans">/ {activeTarget.targetCount} created</span>
                    </h3>
                    <button
                      id="edit-weekly-target-btn"
                      onClick={handleStartEditTarget}
                      className="text-sepia-400 hover:text-sepia-700 p-0.5 transition-all cursor-pointer"
                      title="Adjust target"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-sepia-500 dark:text-sepia-400 mt-1 font-sans font-medium line-clamp-2">
                  {progressPercent >= 100 
                    ? "🎉 Fantastic! You have unlocked your weekly 1000 opportunities milestone!"
                    : "Consistent daily effort leads to breakthrough opportunities. Keep going!"}
                </p>
              </div>
            </div>

            {/* Category summary bars */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-wide">Effort Distribution</span>
              <div className="grid grid-cols-2 gap-2">
                {['Career', 'Business', 'Learning', 'Health'].map((cat) => {
                  const count = weeklyStats.categories[cat] || 0;
                  const percent = Math.min(100, weeklyStats.total > 0 ? Math.round((count / weeklyStats.total) * 100) : 0);
                  return (
                    <div key={cat} className="p-2 rounded-lg bg-cream-50/40 dark:bg-sepia-850/20 border border-cream-150 dark:border-sepia-850 text-[10px]">
                      <div className="flex justify-between font-bold text-sepia-700 dark:text-cream-200">
                        <span>{cat}</span>
                        <span className="font-mono text-sepia-500 dark:text-cream-350">{count} created</span>
                      </div>
                      <div className="w-full bg-cream-100 dark:bg-sepia-950 h-1 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-readflow-green h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coach instruction */}
            <div className="p-2.5 rounded-lg bg-cream-50 dark:bg-sepia-850/30 border border-cream-150 dark:border-sepia-800 text-[10px] text-sepia-700 dark:text-cream-200">
              <p className="font-medium flex items-center gap-1.5">
                <Award className="w-4 h-4 shrink-0 text-readflow-gold" />
                {progressPercent >= 100 
                  ? 'Goal completed! Increase target next week to stretch your limits.' 
                  : `Log ${Math.max(1, activeTarget.targetCount - weeklyStats.total)} more opportunities to hit your custom target!`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Month selector */}
            <div className="flex items-center justify-between">
              <button
                id="btn-prev-month"
                disabled={selectedMonthOffset >= 5}
                onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
                className="p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all text-sepia-400 hover:text-sepia-750 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-sepia-850 dark:text-cream-100 flex items-center gap-1 font-serif">
                <Calendar className="w-3.5 h-3.5 text-readflow-gold" />
                {monthlyStats.name} Statistics
              </span>
              <button
                id="btn-next-month"
                disabled={selectedMonthOffset <= 0}
                onClick={() => setSelectedMonthOffset((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all text-sepia-400 hover:text-sepia-750 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Total count */}
            <div className="text-center py-2 border-b border-cream-150 dark:border-sepia-850">
              <span className="text-2xl font-black font-mono text-readflow-green dark:text-readflow-lightgreen">
                {monthlyStats.total}
              </span>
              <p className="text-[9px] font-bold uppercase text-sepia-400 tracking-wider">Total Opportunities Created</p>
            </div>

            {/* List details */}
            <div className="max-h-[140px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {monthlyStats.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-cream-50/50 dark:bg-sepia-850/10 border border-cream-150 dark:border-sepia-850/40 text-[10px] text-sepia-750 dark:text-cream-200 font-semibold font-sans">
                  <div className="w-1.5 h-1.5 rounded-full bg-readflow-green shrink-0" />
                  <span className="truncate">{detail}</span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-sepia-400 dark:text-sepia-500 text-center italic font-medium">
              Monthly notebooks and qualitative reflections are saved locally in your journal or iPad.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3.5 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <BarChart2 className="w-3.5 h-3.5 text-sepia-400" />
        Weekly reviews reset every Sunday.
      </div>
    </div>
  );
};
