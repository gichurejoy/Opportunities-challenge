/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Opportunity } from '../types';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CalendarDays,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight,
  List
} from 'lucide-react';

interface DeadlineTrackerProps {
  opportunities: Opportunity[];
  onNavigateToLogbook?: () => void;
  onSelectOpportunity?: (id: string) => void;
}

interface DeadlineItem {
  opportunity: Opportunity;
  deadlineDate: Date;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'tomorrow' | 'urgent' | 'upcoming';
  statusText: string;
}

// Helper to download an .ics file for standard calendar clients (Apple, Outlook, etc.)
function downloadICalEvent(opp: Opportunity, date: Date) {
  const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endStr = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//1000 Opportunities Challenge//Deadline Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:opp-${opp.id}-${Date.now()}@opportunities.challenge`,
    `DTSTAMP:${startStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:Deadline: ${opp.title.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${(opp.description || opp.title + ' Application Deadline').replace(/[\r\n]/g, '\\n')}`,
    opp.companyOrClient ? `LOCATION:${opp.companyOrClient.replace(/[,;]/g, ' ')}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${opp.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-deadline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper to generate a Google Calendar template URL
function getGoogleCalendarUrl(opp: Opportunity, date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateParam = `${y}${m}${d}`;
  
  const text = encodeURIComponent(`Deadline: ${opp.title}`);
  const details = encodeURIComponent(
    `1000 Opportunities Challenge - Application Deadline\nTarget: ${opp.companyOrClient || 'N/A'}\nAward / Value: ${opp.expectedValue || 'N/A'}\n\nNotes:\n${opp.description || ''}`
  );
  const location = encodeURIComponent(opp.companyOrClient || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dateParam}/${dateParam}&details=${details}&location=${location}`;
}

export const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({
  opportunities,
  onNavigateToLogbook,
  onSelectOpportunity
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Normalize today's date to midnight local time for fair day comparisons
  const todayMidnight = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  // Parse all opportunities with deadlines
  const deadlineItems: DeadlineItem[] = useMemo(() => {
    const items: DeadlineItem[] = [];

    opportunities.forEach((opp) => {
      if (!opp.deadline || !opp.deadline.trim()) return;

      // Handle standard ISO or YYYY-MM-DD or parseable dates
      const parsed = new Date(opp.deadline);
      if (isNaN(parsed.getTime())) return;

      const dateMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      const msDiff = dateMidnight.getTime() - todayMidnight.getTime();
      const daysRemaining = Math.round(msDiff / (1000 * 60 * 60 * 24));

      let status: DeadlineItem['status'] = 'upcoming';
      let statusText = `in ${daysRemaining} days`;

      if (daysRemaining < 0) {
        status = 'overdue';
        statusText = `Overdue by ${Math.abs(daysRemaining)}d`;
      } else if (daysRemaining === 0) {
        status = 'today';
        statusText = 'Due Today!';
      } else if (daysRemaining === 1) {
        status = 'tomorrow';
        statusText = 'Due Tomorrow';
      } else if (daysRemaining <= 7) {
        status = 'urgent';
        statusText = `${daysRemaining} days left`;
      }

      items.push({
        opportunity: opp,
        deadlineDate: parsed,
        daysRemaining,
        status,
        statusText
      });
    });

    // Sort by ascending days remaining (urgent first)
    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [opportunities, todayMidnight]);

  // Urgent deadlines count
  const urgentCount = deadlineItems.filter((d) => d.status === 'today' || d.status === 'tomorrow' || d.status === 'urgent').length;
  const overdueCount = deadlineItems.filter((d) => d.status === 'overdue').length;

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Map of YYYY-MM-DD to opportunities due on that day
  const deadlinesByDateStr = useMemo(() => {
    const map: { [dateStr: string]: DeadlineItem[] } = {};
    deadlineItems.forEach((item) => {
      const y = item.deadlineDate.getFullYear();
      const m = String(item.deadlineDate.getMonth() + 1).padStart(2, '0');
      const d = String(item.deadlineDate.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [deadlineItems]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  if (deadlineItems.length === 0) {
    return (
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-readflow-gold/15 dark:bg-readflow-gold/25 text-readflow-gold flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-sepia-900 dark:text-cream-100">
                Approaching Deadlines & Calendar
              </h3>
              <p className="text-[11px] text-sepia-500 dark:text-sepia-400">
                Live countdowns, iCal exports, and reminders for scholarship and application cutoffs.
              </p>
            </div>
          </div>
          {onNavigateToLogbook && (
            <button
              onClick={onNavigateToLogbook}
              className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen hover:underline flex items-center gap-1 cursor-pointer"
            >
              Log Deadline in Logbook <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="mt-4 p-4 rounded-xl bg-cream-50/60 dark:bg-sepia-950/40 border border-dashed border-cream-200 dark:border-sepia-800 text-center">
          <Calendar className="w-6 h-6 text-sepia-400 mx-auto mb-1.5 opacity-60" />
          <p className="text-xs font-medium text-sepia-650 dark:text-sepia-300">
            No active deadlines logged yet.
          </p>
          <p className="text-[10px] text-sepia-400 dark:text-sepia-500 mt-0.5">
            When you enter an application deadline for Scholarships, Grants, or Side Work proposals, they will appear here with live countdowns and calendar sync.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden shadow-sm transition-all duration-300">
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-cream-150 dark:border-sepia-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cream-50/50 via-white to-amber-50/20 dark:from-sepia-900 dark:via-sepia-900 dark:to-amber-950/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-sepia-900 dark:text-cream-100">
                Approaching Deadlines & Calendar
              </h3>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20 animate-pulse">
                  {urgentCount} Urgent
                </span>
              )}
              {overdueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  {overdueCount} Past Due
                </span>
              )}
            </div>
            <p className="text-[11px] text-sepia-500 dark:text-sepia-400 mt-0.5">
              Live countdowns and calendar synchronizer for your active opportunities.
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-cream-100 dark:bg-sepia-800 rounded-xl border border-cream-200 dark:border-sepia-700">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-sepia-900 text-readflow-green dark:text-readflow-lightgreen shadow-sm'
                : 'text-sepia-500 hover:text-sepia-800 dark:text-sepia-300'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List & Countdown</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-sepia-900 text-readflow-green dark:text-readflow-lightgreen shadow-sm'
                : 'text-sepia-500 hover:text-sepia-800 dark:text-sepia-300'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Mini-Calendar</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        {viewMode === 'cards' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {deadlineItems.map((item) => {
              const opp = item.opportunity;
              const formattedDate = item.deadlineDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              // Status badge colors
              const badgeColors =
                item.status === 'today'
                  ? 'bg-rose-500 text-white font-extrabold shadow-sm animate-pulse'
                  : item.status === 'tomorrow'
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : item.status === 'urgent'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                  : item.status === 'overdue'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 line-through'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';

              const googleCalUrl = getGoogleCalendarUrl(opp, item.deadlineDate);

              return (
                <div
                  key={opp.id}
                  className="relative group p-4 rounded-xl bg-cream-50/70 dark:bg-sepia-950/50 border border-cream-200 dark:border-sepia-800 hover:border-readflow-green/40 dark:hover:border-readflow-olive transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Status pill and Category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-tight ${badgeColors}`}>
                        {item.statusText}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-sepia-500 dark:text-sepia-400 bg-white dark:bg-sepia-900 px-2 py-0.5 rounded-md border border-cream-200 dark:border-sepia-800">
                        {opp.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-serif font-bold text-sepia-900 dark:text-cream-100 line-clamp-1 leading-snug">
                      {opp.title}
                    </h4>

                    {/* Entity & Value */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-sepia-600 dark:text-sepia-300">
                      {opp.companyOrClient && (
                        <span className="inline-flex items-center gap-1">
                          <Building className="w-3 h-3 text-sepia-400" />
                          <span className="truncate max-w-[140px]">{opp.companyOrClient}</span>
                        </span>
                      )}
                      {opp.expectedValue && (
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {opp.expectedValue}
                        </span>
                      )}
                    </div>

                    {/* Deadline target date */}
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-sepia-500 dark:text-sepia-400">
                      <Calendar className="w-3 h-3 text-readflow-gold" />
                      <span>Due: {formattedDate}</span>
                    </div>

                    {/* Checklist readiness indicator */}
                    {(opp.eligibilityChecklist || opp.requirementsChecklist) && (
                      <div className="mt-2 pt-2 border-t border-cream-150 dark:border-sepia-800 flex items-center gap-2 text-[10px]">
                        {opp.eligibilityChecklist && opp.eligibilityChecklist.length > 0 && (
                          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                            {opp.eligibilityChecklist.filter((c) => c.completed).length}/{opp.eligibilityChecklist.length} Criteria
                          </span>
                        )}
                        {opp.requirementsChecklist && opp.requirementsChecklist.length > 0 && (
                          <span className="bg-readflow-green/10 dark:bg-readflow-green/20 text-readflow-green dark:text-readflow-lightgreen px-1.5 py-0.5 rounded font-mono font-bold">
                            {opp.requirementsChecklist.filter((c) => c.completed).length}/{opp.requirementsChecklist.length} Submissions
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-cream-150 dark:border-sepia-800 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1">
                      {/* Google Calendar Link */}
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-white dark:bg-sepia-900 hover:bg-cream-100 dark:hover:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-700 dark:text-cream-200 text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Add this deadline to Google Calendar"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-readflow-gold" />
                        Google Cal
                      </a>

                      {/* Download .ics */}
                      <button
                        onClick={() => downloadICalEvent(opp, item.deadlineDate)}
                        className="px-2 py-1 rounded bg-white dark:bg-sepia-900 hover:bg-cream-100 dark:hover:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-700 dark:text-cream-200 text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download .ics event for Apple Calendar / Outlook"
                      >
                        <Download className="w-2.5 h-2.5 text-readflow-green" />
                        iCal
                      </button>
                    </div>

                    {onNavigateToLogbook && (
                      <button
                        onClick={() => {
                          if (onSelectOpportunity) onSelectOpportunity(opp.id);
                          onNavigateToLogbook();
                        }}
                        className="text-[10px] font-bold text-readflow-green dark:text-readflow-lightgreen hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        Logbook →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Mini Calendar View */
          <div className="space-y-4">
            {/* Month Nav */}
            <div className="flex items-center justify-between max-w-sm mx-auto pb-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-600 dark:text-cream-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-serif font-bold text-sepia-900 dark:text-cream-100">
                {monthName}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-600 dark:text-cream-200 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="text-[10px] font-mono font-bold text-sepia-400">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before 1st day of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 rounded-lg bg-transparent" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isToday =
                    year === todayMidnight.getFullYear() &&
                    month === todayMidnight.getMonth() &&
                    dayNum === todayMidnight.getDate();

                  const dayItems = deadlinesByDateStr[dateStr] || [];
                  const hasDeadline = dayItems.length > 0;
                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedCalendarDate(hasDeadline ? dateStr : null)}
                      className={`h-11 rounded-xl p-1 flex flex-col items-center justify-between text-xs font-mono transition-all cursor-pointer relative ${
                        isSelected
                          ? 'ring-2 ring-readflow-gold bg-readflow-green text-cream-50 font-bold'
                          : hasDeadline
                          ? 'bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold hover:scale-105'
                          : isToday
                          ? 'border border-readflow-green text-readflow-green font-bold bg-cream-50 dark:bg-sepia-800'
                          : 'text-sepia-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-sepia-800'
                      }`}
                    >
                      <span className="text-[11px] leading-tight">{dayNum}</span>
                      {hasDeadline && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Details */}
            {selectedCalendarDate && deadlinesByDateStr[selectedCalendarDate] && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-serif font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Deadlines on {selectedCalendarDate} ({deadlinesByDateStr[selectedCalendarDate].length})
                  </span>
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-[10px] text-sepia-400 hover:text-sepia-700 font-mono"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2">
                  {deadlinesByDateStr[selectedCalendarDate].map((item) => (
                    <div
                      key={item.opportunity.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-sepia-900 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-sepia-900 dark:text-cream-100 block">
                          {item.opportunity.title}
                        </span>
                        <span className="text-[10px] text-sepia-500 dark:text-sepia-400">
                          {item.opportunity.companyOrClient || item.opportunity.category} • {item.statusText}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={getGoogleCalendarUrl(item.opportunity, item.deadlineDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-cream-100 dark:bg-sepia-800 text-[10px] font-bold rounded hover:bg-cream-200"
                        >
                          Google Cal
                        </a>
                        <button
                          onClick={() => downloadICalEvent(item.opportunity, item.deadlineDate)}
                          className="px-2 py-1 bg-cream-100 dark:bg-sepia-800 text-[10px] font-bold rounded hover:bg-cream-200 cursor-pointer"
                        >
                          .ics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
