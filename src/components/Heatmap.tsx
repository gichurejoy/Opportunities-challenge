/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Opportunity } from '../types';
import { Calendar } from 'lucide-react';

interface HeatmapProps {
  opportunities: Opportunity[];
}

export const Heatmap: React.FC<HeatmapProps> = ({ opportunities }) => {
  // Let's build a grid representing the past 22 weeks, ending on the current week.
  const gridData = useMemo(() => {
    const today = new Date();
    
    // Find the starting Sunday of 22 weeks ago
    // 22 weeks * 7 days = 154 days
    const totalDays = 154;
    const endOfWeekOffset = 6 - today.getDay(); // days to next Saturday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endOfWeekOffset);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1); // exactly totalDays length

    // Map opportunities to quick lookup dictionary by date (YYYY-MM-DD)
    const oppsByDate: { [dateStr: string]: { count: number; points: number; titles: string[] } } = {};
    opportunities.forEach((opp) => {
      const dateKey = opp.timestamp.split('T')[0];
      if (!oppsByDate[dateKey]) {
        oppsByDate[dateKey] = { count: 0, points: 0, titles: [] };
      }
      oppsByDate[dateKey].count += 1;
      oppsByDate[dateKey].points += opp.points;
      if (oppsByDate[dateKey].titles.length < 3) {
        oppsByDate[dateKey].titles.push(opp.title);
      }
    });

    const weeks: { date: Date; dayOfWeek: number; dateStr: string; info?: typeof oppsByDate[string] }[][] = [];
    let currentWeek: typeof weeks[number] = [];

    const tempDate = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const info = oppsByDate[dateStr];
      
      currentWeek.push({
        date: new Date(tempDate),
        dayOfWeek: tempDate.getDay(),
        dateStr,
        info,
      });

      if (tempDate.getDay() === 6 || i === totalDays - 1) {
        // End of week (Saturday) or last day
        weeks.push(currentWeek);
        currentWeek = [];
      }

      tempDate.setDate(tempDate.getDate() + 1);
    }

    return { weeks, startDate, endDate, today };
  }, [opportunities]);

  const { weeks } = gridData;

  // Row labels for days of week
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to determine background intensity
  const getIntensityClass = (count: number) => {
    if (!count) return 'bg-cream-100 dark:bg-sepia-800 hover:bg-cream-200 dark:hover:bg-sepia-700';
    if (count === 1) return 'bg-readflow-lightgreen/30 dark:bg-readflow-green/20 text-readflow-green hover:bg-readflow-lightgreen/50';
    if (count === 2) return 'bg-readflow-lightgreen/70 dark:bg-readflow-olive/40 text-sepia-900 hover:bg-readflow-lightgreen/90';
    if (count === 3) return 'bg-readflow-green dark:bg-readflow-olive text-cream-50 hover:bg-opacity-90';
    return 'bg-emerald-900 dark:bg-readflow-lightgreen text-cream-50 hover:bg-opacity-90'; // 4+ opportunities
  };

  return (
    <div id="heatmap-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300 font-sans">
      <div>
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2 mb-1">
          <Calendar className="w-5 h-5 text-readflow-gold" />
          Opportunity Heatmap
        </h2>
        <p className="text-xs text-sepia-400 dark:text-sepia-500 mb-4 font-sans font-medium">
          Tracking the consistency of actions created, not outcomes.
        </p>
      </div>

      {/* Grid container */}
      <div className="flex-1 flex flex-col justify-center overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex min-w-[380px] justify-center items-start gap-1">
          {/* Day of Week Column labels */}
          <div className="grid grid-rows-7 gap-1 pr-1.5 text-[9px] font-semibold text-sepia-400 text-right h-[126px] justify-center items-center">
            {DAY_LABELS.map((day, idx) => (
              <span key={day} className={idx % 2 === 0 ? 'invisible' : 'visible h-3 leading-3'}>
                {day}
              </span>
            ))}
          </div>

          {/* Grid weeks */}
          <div className="flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-rows-7 gap-1 h-[126px]">
                {week.map((day) => {
                  const hasOpps = !!day.info?.count;
                  const count = day.info?.count || 0;
                  const pts = day.info?.points || 0;
                  const list = day.info?.titles || [];
                  const todayMidnight = new Date(gridData.today.getFullYear(), gridData.today.getMonth(), gridData.today.getDate(), 23, 59, 59);
                  const isFuture = day.date > todayMidnight;

                  const isTopRow = day.dayOfWeek <= 2;
                  const isRightEdge = weekIdx >= weeks.length - 4;
                  const isLeftEdge = weekIdx < 3;

                  const tooltipVertClass = isTopRow ? 'top-full mt-2' : 'bottom-full mb-2';
                  const tooltipHorizClass = isRightEdge 
                    ? 'right-0' 
                    : isLeftEdge 
                    ? 'left-0' 
                    : 'left-1/2 -translate-x-1/2';

                  const arrowVertClass = isTopRow ? '-top-2 rotate-180' : 'top-full';
                  const arrowHorizClass = isRightEdge 
                    ? 'right-2' 
                    : isLeftEdge 
                    ? 'left-2' 
                    : 'left-1/2 -translate-x-1/2';

                  return (
                    <div
                      key={day.dateStr}
                      id={`day-${day.dateStr}`}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all relative group cursor-pointer ${
                        isFuture ? 'bg-cream-50 dark:bg-sepia-950 border border-dashed border-cream-200 dark:border-sepia-800' : getIntensityClass(count)
                      }`}
                    >
                      {/* Interactive Custom Tooltip on hover with smart positioning */}
                      <div className={`absolute ${tooltipVertClass} ${tooltipHorizClass} w-48 bg-sepia-950 text-cream-50 rounded-lg p-2.5 text-[10px] leading-relaxed shadow-xl hidden group-hover:block z-30 pointer-events-none border border-sepia-800`}>
                        <div className="font-bold text-cream-200 border-b border-sepia-800 pb-1 mb-1.5 flex justify-between items-center">
                          <span>{day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {hasOpps && <span className="bg-readflow-green text-cream-50 font-bold px-1.5 py-0.2 rounded font-mono">+{pts} pts</span>}
                        </div>
                        {hasOpps ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-readflow-lightgreen">Created {count} {count === 1 ? 'opportunity' : 'opportunities'}:</p>
                            <ul className="list-disc list-inside space-y-0.5 truncate text-cream-100 pl-0.5">
                              {list.map((t, idx) => (
                                <li key={idx} className="truncate">{t}</li>
                              ))}
                              {count > 3 && <li className="italic text-[9px] text-cream-300">and {count - 3} more...</li>}
                            </ul>
                          </div>
                        ) : isFuture ? (
                          <p className="text-sepia-300 italic">Uncharted future...</p>
                        ) : (
                          <p className="text-sepia-300">0 opportunities created today.</p>
                        )}
                        <svg className={`absolute ${arrowVertClass} ${arrowHorizClass} text-sepia-950 w-2.5 h-2.5 fill-current`} viewBox="0 0 10 10">
                          <polygon points="5,5 0,0 10,0" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Month Markers */}
      <div className="flex items-center justify-between text-[10px] text-sepia-400 border-t border-cream-150 dark:border-sepia-850 pt-3 mt-3">
        <div className="flex gap-3">
          <span>{new Date(Date.now() - 90 * 86400000).toLocaleDateString(undefined, { month: 'short' })}</span>
          <span>{new Date(Date.now() - 60 * 86400000).toLocaleDateString(undefined, { month: 'short' })}</span>
          <span>{new Date(Date.now() - 30 * 86400000).toLocaleDateString(undefined, { month: 'short' })}</span>
          <span className="font-semibold text-sepia-700 dark:text-cream-200">
            {new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-cream-100 dark:bg-sepia-800"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-readflow-lightgreen/30 dark:bg-readflow-green/20"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-readflow-lightgreen/70 dark:bg-readflow-olive/40"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-readflow-green dark:bg-readflow-olive"></div>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-900 dark:bg-readflow-lightgreen"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
