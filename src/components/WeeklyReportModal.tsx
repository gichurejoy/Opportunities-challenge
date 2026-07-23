/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, Sparkles, Trophy, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Opportunity, OpportunityPipeline, Vision } from '../types';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  pipelines: OpportunityPipeline[];
  visions: Vision[];
  userName?: string;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  pipelines,
  visions,
  userName = 'Opportunity Creator',
}) => {
  if (!isOpen) return null;

  const totalOpps = opportunities.length;
  const totalPoints = opportunities.reduce((sum, o) => sum + o.points, 0);
  const totalVisions = visions.length;
  const completedVisions = visions.filter((v) => v.isCompleted).length;
  const wonDeals = pipelines.filter((p) => p.status === 'won').length;

  // Category breakdown
  const categoryCounts: Record<string, { count: number; points: number }> = {};
  opportunities.forEach((o) => {
    if (!categoryCounts[o.category]) {
      categoryCounts[o.category] = { count: 0, points: 0 };
    }
    categoryCounts[o.category].count += 1;
    categoryCounts[o.category].points += o.points;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Company/Client', 'Category', 'Type', 'Points', 'Timestamp'];
    const rows = opportunities.map((o) => [
      o.id,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${(o.companyOrClient || '').replace(/"/g, '""')}"`,
      o.category,
      o.type,
      o.points,
      o.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `opportunities_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn print:bg-white print:p-0">
      <div className="relative w-full max-w-3xl bg-cream-50 dark:bg-sepia-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden max-h-[90vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:rounded-none">
        
        {/* Modal Actions Header */}
        <div className="p-4 bg-cream-100 dark:bg-sepia-950 border-b border-cream-200 dark:border-sepia-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-sepia-900 dark:text-cream-100">
            <Sparkles className="w-4 h-4 text-readflow-gold" />
            <span>Weekly Catalyst Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-stone-700 dark:text-cream-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-cream-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-readflow-green hover:bg-readflow-olive text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-readflow-gold" /> Print Report
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:text-cream-300 rounded-full hover:bg-cream-200 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Content Body (Printable) */}
        <div className="p-8 overflow-y-auto space-y-6 text-sepia-900 dark:text-cream-100 print:p-6 print:text-black">
          
          {/* Header Banner */}
          <div className="border-b border-cream-200 dark:border-sepia-800 pb-5 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-mono font-bold text-readflow-gold uppercase tracking-widest block mb-1">
                1,000 Opportunities Challenge
              </span>
              <h2 className="text-3xl font-serif font-bold tracking-tight">
                Catalyst Performance Summary
              </h2>
              <p className="text-xs text-stone-500 dark:text-cream-300 mt-1 font-light">
                Prepared for: <strong className="font-semibold">{userName}</strong> • Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-2xl font-bold text-readflow-green dark:text-readflow-lightgreen">
                {totalOpps} / 1000
              </span>
              <span className="text-[10px] text-stone-400 block uppercase">Total Progress</span>
            </div>
          </div>

          {/* Core Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-sepia-950 rounded-2xl border border-cream-200 dark:border-sepia-800 text-center">
              <span className="text-xs text-stone-400 font-mono uppercase block">Total Points</span>
              <span className="text-2xl font-serif font-bold text-readflow-gold mt-1 block">+{totalPoints}</span>
            </div>
            <div className="p-4 bg-white dark:bg-sepia-950 rounded-2xl border border-cream-200 dark:border-sepia-800 text-center">
              <span className="text-xs text-stone-400 font-mono uppercase block">Won Deals</span>
              <span className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{wonDeals}</span>
            </div>
            <div className="p-4 bg-white dark:bg-sepia-950 rounded-2xl border border-cream-200 dark:border-sepia-800 text-center">
              <span className="text-xs text-stone-400 font-mono uppercase block">Active Visions</span>
              <span className="text-2xl font-serif font-bold text-sepia-800 dark:text-cream-100 mt-1 block">{totalVisions}</span>
            </div>
            <div className="p-4 bg-white dark:bg-sepia-950 rounded-2xl border border-cream-200 dark:border-sepia-800 text-center">
              <span className="text-xs text-stone-400 font-mono uppercase block">Completed Visions</span>
              <span className="text-2xl font-serif font-bold text-readflow-green dark:text-readflow-lightgreen mt-1 block">{completedVisions}</span>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-readflow-green" />
              Category Momentum Breakdown
            </h4>

            <div className="bg-white dark:bg-sepia-950 rounded-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 dark:bg-sepia-900 text-stone-500 dark:text-cream-300 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Logged Actions</th>
                    <th className="p-3">Points Contributed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-150 dark:divide-sepia-850">
                  {Object.keys(categoryCounts).length > 0 ? (
                    Object.entries(categoryCounts).map(([cat, data]) => (
                      <tr key={cat} className="hover:bg-cream-50/50 dark:hover:bg-sepia-900/50">
                        <td className="p-3 font-semibold font-serif text-sepia-900 dark:text-cream-100">{cat}</td>
                        <td className="p-3 font-mono">{data.count} actions</td>
                        <td className="p-3 font-mono text-readflow-gold font-bold">+{data.points} pts</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-stone-400 italic">No logged opportunities yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Wins */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-readflow-gold" />
              Recent Outbound Logs
            </h4>

            <div className="space-y-2">
              {opportunities.slice(0, 5).map((o) => (
                <div key={o.id} className="p-3 bg-white dark:bg-sepia-950 rounded-xl border border-cream-200 dark:border-sepia-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-sepia-900 dark:text-cream-100 block">{o.title}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {o.category} • {o.type} {o.companyOrClient ? `• Target: ${o.companyOrClient}` : ''}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-readflow-gold text-xs">+{o.points} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
