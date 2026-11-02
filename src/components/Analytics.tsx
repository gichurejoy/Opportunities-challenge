/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Briefcase, 
  Building, 
  GraduationCap, 
  Laptop, 
  Rocket, 
  BookOpen, 
  Coins, 
  Activity, 
  Heart, 
  Sprout, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  ChevronRight,
  Filter,
  BarChart2,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { Opportunity, OpportunityPipeline } from '../types';
import { CATEGORY_PIPELINE_TEMPLATES } from '../utils/pipelineStages';

interface AnalyticsProps {
  opportunities?: Opportunity[];
  pipelines?: OpportunityPipeline[];
}

interface CategoryConfig {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  metric1Label: string;
  metric2Label: string;
  metric3Label: string;
}

const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    name: 'Career',
    icon: Briefcase,
    color: '#1b3d22',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    metric1Label: 'Applications',
    metric2Label: 'Interviews',
    metric3Label: 'Offers Won',
  },
  {
    name: 'Scholarships',
    icon: GraduationCap,
    color: '#2b5282',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeBorder: 'border-blue-200 dark:border-blue-900/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    metric1Label: 'Submitted',
    metric2Label: 'In Review',
    metric3Label: 'Grants Won',
  },
  {
    name: 'Business',
    icon: Building,
    color: '#c29543',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeBorder: 'border-amber-200 dark:border-amber-900/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    metric1Label: 'Outreach',
    metric2Label: 'Pitches',
    metric3Label: 'Deals Won',
  },
  {
    name: 'Side Work',
    icon: Laptop,
    color: '#0d9488',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    badgeBorder: 'border-teal-200 dark:border-teal-900/60',
    badgeText: 'text-teal-800 dark:text-teal-300',
    metric1Label: 'Gigs Pitched',
    metric2Label: 'In Progress',
    metric3Label: 'Paid Contracts',
  },
  {
    name: 'Side Projects',
    icon: Rocket,
    color: '#3d617a',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    badgeBorder: 'border-sky-200 dark:border-sky-900/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    metric1Label: 'Concepts',
    metric2Label: 'Developing',
    metric3Label: 'Launched',
  },
  {
    name: 'Learning',
    icon: BookOpen,
    color: '#3f5d45',
    badgeBg: 'bg-lime-50 dark:bg-lime-950/40',
    badgeBorder: 'border-lime-200 dark:border-lime-900/60',
    badgeText: 'text-lime-800 dark:text-lime-300',
    metric1Label: 'Enrolled',
    metric2Label: 'Active Study',
    metric3Label: 'Mastered',
  },
  {
    name: 'Finance',
    icon: Coins,
    color: '#967433',
    badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40',
    badgeBorder: 'border-yellow-200 dark:border-yellow-900/60',
    badgeText: 'text-yellow-800 dark:text-yellow-300',
    metric1Label: 'Opportunities',
    metric2Label: 'In Progress',
    metric3Label: 'Goals Executed',
  },
  {
    name: 'Health',
    icon: Activity,
    color: '#a64d4d',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeBorder: 'border-rose-200 dark:border-rose-900/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    metric1Label: 'Habits/Goals',
    metric2Label: 'Active Routine',
    metric3Label: 'Milestones Met',
  },
  {
    name: 'Personal',
    icon: Heart,
    color: '#9e527f',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeBorder: 'border-pink-200 dark:border-pink-900/60',
    badgeText: 'text-pink-800 dark:text-pink-300',
    metric1Label: 'Outreach',
    metric2Label: 'Deepening',
    metric3Label: 'Milestones Won',
  },
  {
    name: 'Farming',
    icon: Sprout,
    color: '#567d26',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeBorder: 'border-emerald-200 dark:border-emerald-900/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    metric1Label: 'Cycles Planned',
    metric2Label: 'Active Tending',
    metric3Label: 'Harvests Won',
  },
];

// Helper to parse monetary string values
function parseVal(valStr?: string): number {
  if (!valStr) return 0;
  const cleaned = valStr.toLowerCase().replace(/[^0-9.km]/g, '');
  if (!cleaned) return 0;
  let multiplier = 1;
  if (cleaned.endsWith('k')) multiplier = 1000;
  else if (cleaned.endsWith('m')) multiplier = 1000000;
  const num = parseFloat(cleaned.replace(/[km]/g, ''));
  return isNaN(num) ? 0 : num * multiplier;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  opportunities = [],
  pipelines = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'funnel' | 'categories'>('funnel');

  // Compute category funnel metrics
  const categoryStats = useMemo(() => {
    return CATEGORIES_CONFIG.map((config) => {
      const catOpps = opportunities.filter((o) => o.category === config.name);
      const catPipes = pipelines.filter((p) => p.category === config.name);
      const template = CATEGORY_PIPELINE_TEMPLATES[config.name];
      const terminalWon = template?.terminalWon || 'Won 🎉';
      const terminalLost = template?.terminalLost || 'Lost';

      const total = catOpps.length;
      
      let m1 = total;
      let m2 = 0;
      let m3 = 0;

      if (config.name === 'Career') {
        m1 = catOpps.filter((o) => ['Applied', 'Interviewing', 'Offer', 'Won 🎉'].includes(o.stage || '') || (o.type && o.type.toLowerCase().includes('application'))).length;
        m2 = catOpps.filter((o) => ['Interviewing', 'Screening'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => ['Offer', 'Won 🎉'].includes(o.stage || '')).length + catPipes.filter((p) => p.status === 'won').length;
      } else if (config.name === 'Scholarships') {
        m1 = catOpps.filter((o) => ['Submitted', 'In Review', 'Interview / Finalist', 'Awarded 🎉'].includes(o.stage || '')).length || total;
        m2 = catOpps.filter((o) => ['In Review', 'Interview / Finalist'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => o.stage === 'Awarded 🎉' || (o.stage && o.stage.includes('Won'))).length + catPipes.filter((p) => p.status === 'won').length;
      } else if (config.name === 'Business') {
        m1 = total;
        m2 = catOpps.filter((o) => ['Discovery / Pitched', 'Proposal Sent', 'Negotiation'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => ['Contract Signed', 'Won 🎉'].includes(o.stage || '')).length + catPipes.filter((p) => p.status === 'won').length;
      } else if (config.name === 'Side Work') {
        m1 = total;
        m2 = catOpps.filter((o) => ['Scope & Quote', 'Contract Signed', 'In Progress'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => o.stage === 'Delivered & Paid 🎉').length + catPipes.filter((p) => p.status === 'won').length;
      } else if (config.name === 'Side Projects') {
        m1 = total;
        m2 = catOpps.filter((o) => ['In Progress', 'Alpha / MVP', 'Review'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => o.stage === 'Launched 🎉').length + catPipes.filter((p) => p.status === 'won').length;
      } else if (config.name === 'Learning') {
        m1 = total;
        m2 = catOpps.filter((o) => ['Enrolled', 'In Progress', 'Exam / Review'].includes(o.stage || '')).length;
        m3 = catOpps.filter((o) => o.stage === 'Completed 🎉' || o.stage === 'Completed').length + catPipes.filter((p) => p.status === 'won').length;
      } else {
        m1 = total;
        m2 = catOpps.filter((o) => {
          if (!o.stage) return false;
          return o.stage !== template?.stages[0] && o.stage !== terminalWon && o.stage !== terminalLost;
        }).length;
        m3 = catOpps.filter((o) => o.stage === terminalWon || (o.stage && o.stage.includes('Won')) || (o.stage && o.stage.includes('Completed'))).length + catPipes.filter((p) => p.status === 'won').length;
      }

      const denominator = m1 > 0 ? m1 : total;
      const conversion = denominator > 0 ? Math.min(100, Math.round((m3 / denominator) * 100)) : 0;

      return {
        ...config,
        total,
        m1,
        m2,
        m3,
        conversion,
        activePipelines: catPipes.filter((p) => p.status === 'active').length,
        recentOpps: catOpps.slice(0, 3),
      };
    });
  }, [opportunities, pipelines]);

  // Overall aggregate metrics across all categories
  const overallMetrics = useMemo(() => {
    const totalOpps = opportunities.length;
    const totalWins = categoryStats.reduce((sum, c) => sum + c.m3, 0);
    const activePipelines = pipelines.filter((p) => p.status === 'active').length;
    const overallConversion = totalOpps > 0 ? Math.min(100, Math.round((totalWins / totalOpps) * 100)) : 0;
    return { totalOpps, totalWins, activePipelines, overallConversion };
  }, [opportunities, categoryStats, pipelines]);

  // Visual Funnel calculation across selected scope
  const funnelData = useMemo(() => {
    const targetOpps = selectedCategory === 'All' 
      ? opportunities 
      : opportunities.filter((o) => o.category === selectedCategory);

    const total = Math.max(1, targetOpps.length);

    // Tier 1: Sourced / Outbound Top of Funnel
    const tier1Count = targetOpps.length;
    const tier1Value = targetOpps.reduce((sum, o) => sum + parseVal(o.expectedValue), 0);

    // Tier 2: Mid-Funnel (In Motion / Screened / Pitched / Enrolled)
    const tier2Opps = targetOpps.filter((o) => {
      const template = CATEGORY_PIPELINE_TEMPLATES[o.category];
      const initialStage = template?.stages[0] || 'Sourced';
      const terminalWon = template?.terminalWon || 'Won 🎉';
      const terminalLost = template?.terminalLost || 'Lost';
      return o.stage && o.stage !== initialStage && o.stage !== terminalWon && o.stage !== terminalLost;
    });
    const tier2Count = tier2Opps.length;
    const tier2Value = tier2Opps.reduce((sum, o) => sum + parseVal(o.expectedValue), 0);

    // Tier 3: Late Stage (Interviews / Finalist / Proposals / Negotiations)
    const tier3Opps = targetOpps.filter((o) => {
      const s = (o.stage || '').toLowerCase();
      return s.includes('interview') || s.includes('finalist') || s.includes('offer') || s.includes('negotiat') || s.includes('quote') || s.includes('contract') || s.includes('review');
    });
    const tier3Count = tier3Opps.length;
    const tier3Value = tier3Opps.reduce((sum, o) => sum + parseVal(o.expectedValue), 0);

    // Tier 4: Bottom Funnel (Won / Secured / Awarded / Completed)
    const tier4Opps = targetOpps.filter((o) => {
      const s = (o.stage || '').toLowerCase();
      return s.includes('won') || s.includes('award') || s.includes('paid') || s.includes('complete') || s.includes('launched');
    });
    const tier4Count = tier4Opps.length;
    const tier4Value = tier4Opps.reduce((sum, o) => sum + parseVal(o.expectedValue), 0);

    // Percentages of total
    const tier1Pct = 100;
    const tier2Pct = Math.min(100, Math.round((tier2Count / total) * 100));
    const tier3Pct = Math.min(100, Math.round((tier3Count / total) * 100));
    const tier4Pct = Math.min(100, Math.round((tier4Count / total) * 100));

    // Calculate Average Cycle Days to Decision
    const closedItems = targetOpps.filter((o) => {
      const s = (o.stage || '').toLowerCase();
      return s.includes('won') || s.includes('award') || s.includes('paid') || s.includes('complete') || s.includes('lost');
    });

    let avgDays = 0;
    if (closedItems.length > 0) {
      const totalDays = closedItems.reduce((sum, opp) => {
        const created = new Date(opp.timestamp).getTime();
        const latestAct = opp.activityLog && opp.activityLog.length > 0
          ? new Date(opp.activityLog[0].timestamp).getTime()
          : Date.now();
        const diff = Math.max(1, Math.round((latestAct - created) / (1000 * 60 * 60 * 24)));
        return sum + diff;
      }, 0);
      avgDays = Math.round(totalDays / closedItems.length);
    } else {
      avgDays = targetOpps.length > 0 ? 5 : 0;
    }

    // Top Converting Category
    const sortedCats = [...categoryStats].filter((c) => c.total > 0).sort((a, b) => b.conversion - a.conversion);
    const topCategory = sortedCats[0] || null;

    return {
      tier1: { label: 'Top: Sourced & Logged', count: tier1Count, pct: tier1Pct, value: tier1Value },
      tier2: { label: 'Mid: Active Outreach & In Review', count: tier2Count, pct: tier2Pct, value: tier2Value },
      tier3: { label: 'Late: Finalist / Interview / Proposal', count: tier3Count, pct: tier3Pct, value: tier3Value },
      tier4: { label: 'Bottom: Closed Won & Awarded', count: tier4Count, pct: tier4Pct, value: tier4Value },
      avgDays,
      topCategory,
    };
  }, [opportunities, selectedCategory, categoryStats]);

  // Active category detail when one category is selected
  const activeCategoryStat = useMemo(() => {
    if (selectedCategory === 'All') return null;
    return categoryStats.find((c) => c.name === selectedCategory) || null;
  }, [categoryStats, selectedCategory]);

  return (
    <div id="analytics-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm flex flex-col justify-between transition-all duration-300">
      <div>
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-readflow-gold dark:text-readflow-lightgold" />
              Opportunity Analytics
            </h2>
            <p className="text-xs text-sepia-500 dark:text-cream-300 font-sans">
              Conversion funnels and tracking metrics across all 10 opportunity categories.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Funnel Visualizer vs Categories */}
            <div className="flex items-center bg-cream-100 dark:bg-sepia-800 p-0.5 rounded-lg border border-cream-200 dark:border-sepia-700">
              <button
                type="button"
                id="analytics-mode-funnel"
                onClick={() => setViewMode('funnel')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'funnel'
                    ? 'bg-readflow-green dark:bg-readflow-olive text-cream-50 shadow-xs'
                    : 'text-sepia-600 dark:text-cream-300 hover:text-sepia-900 dark:hover:text-cream-100'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Funnel Chart
              </button>
              <button
                type="button"
                id="analytics-mode-categories"
                onClick={() => setViewMode('categories')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'categories'
                    ? 'bg-readflow-green dark:bg-readflow-olive text-cream-50 shadow-xs'
                    : 'text-sepia-600 dark:text-cream-300 hover:text-sepia-900 dark:hover:text-cream-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Categories
              </button>
            </div>

            {selectedCategory !== 'All' && (
              <button
                type="button"
                id="analytics-view-all-btn"
                onClick={() => setSelectedCategory('All')}
                className="text-[11px] font-bold text-readflow-green dark:text-readflow-lightgreen hover:underline cursor-pointer flex items-center gap-1"
              >
                ← All
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          <button
            type="button"
            id="analytics-tab-all"
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-readflow-green dark:bg-readflow-olive text-cream-50 shadow-xs'
                : 'bg-cream-100 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 hover:bg-cream-200 dark:hover:bg-sepia-750 border border-cream-200 dark:border-sepia-700'
            }`}
          >
            All Categories ({opportunities.length})
          </button>

          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                type="button"
                key={cat.name}
                id={`analytics-tab-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-readflow-green dark:bg-readflow-olive text-cream-50 shadow-xs'
                    : 'bg-cream-100 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 hover:bg-cream-200 dark:hover:bg-sepia-750 border border-cream-200 dark:border-sepia-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.name}</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-mono ${
                  isSelected ? 'bg-black/20 text-cream-50' : 'bg-cream-200 dark:bg-sepia-700 text-sepia-700 dark:text-cream-200'
                }`}>
                  {cat.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Executive Summary Strip for All Categories */}
        {selectedCategory === 'All' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-cream-50/70 dark:bg-sepia-850/80 border border-cream-200/80 dark:border-sepia-750 mb-4">
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">Total Logs</span>
              <span className="text-base font-bold font-mono text-sepia-900 dark:text-cream-100">{overallMetrics.totalOpps}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">In Pipelines</span>
              <span className="text-base font-bold font-mono text-readflow-gold dark:text-readflow-lightgold">{overallMetrics.activePipelines}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">Wins Secured</span>
              <span className="text-base font-bold font-mono text-readflow-green dark:text-readflow-lightgreen">{overallMetrics.totalWins}</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">Win Conversion</span>
              <span className="text-base font-bold font-mono text-readflow-green dark:text-readflow-lightgreen">{overallMetrics.overallConversion}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main View Area: Visual Funnel Chart OR Category Cards Grid */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {viewMode === 'funnel' ? (
          /* VISUAL FUNNEL CHART & VELOCITY METER */
          <div className="space-y-4 animate-fadeIn">
            {/* Visual Funnel Waterfall Bars */}
            <div className="p-4 rounded-xl bg-cream-50/60 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-750 space-y-3">
              <div className="flex items-center justify-between border-b border-cream-200/60 dark:border-sepia-750 pb-2">
                <span className="text-xs font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-1.5 font-serif">
                  <BarChart2 className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen" />
                  Conversion Funnel ({selectedCategory})
                </span>
                <span className="text-[10px] font-mono text-sepia-500 dark:text-cream-300">
                  {funnelData.tier4.count} of {funnelData.tier1.count} closed won
                </span>
              </div>

              {/* Tapered Funnel Tiers */}
              <div className="space-y-2.5 pt-1">
                {/* Tier 1 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-sepia-800 dark:text-cream-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sepia-400 dark:bg-sepia-500" />
                      {funnelData.tier1.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {funnelData.tier1.value > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ${funnelData.tier1.value >= 1000 ? `${Math.round(funnelData.tier1.value / 1000)}k` : funnelData.tier1.value}
                        </span>
                      )}
                      <span className="font-mono font-bold text-sepia-900 dark:text-cream-100">{funnelData.tier1.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-cream-200/60 dark:bg-sepia-800 rounded-lg overflow-hidden flex items-center px-2">
                    <div className="h-full bg-sepia-400/80 dark:bg-sepia-600 rounded-md w-full transition-all duration-500" />
                  </div>
                </div>

                {/* Tier 2 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-sepia-800 dark:text-cream-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {funnelData.tier2.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {funnelData.tier2.value > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ${funnelData.tier2.value >= 1000 ? `${Math.round(funnelData.tier2.value / 1000)}k` : funnelData.tier2.value}
                        </span>
                      )}
                      <span className="font-mono font-bold text-sepia-900 dark:text-cream-100">{funnelData.tier2.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-cream-200/60 dark:bg-sepia-800 rounded-lg overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-md transition-all duration-500 min-w-3"
                      style={{ width: `${Math.max(6, funnelData.tier2.pct)}%` }}
                    />
                  </div>
                </div>

                {/* Tier 3 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-sepia-800 dark:text-cream-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-readflow-gold" />
                      {funnelData.tier3.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {funnelData.tier3.value > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ${funnelData.tier3.value >= 1000 ? `${Math.round(funnelData.tier3.value / 1000)}k` : funnelData.tier3.value}
                        </span>
                      )}
                      <span className="font-mono font-bold text-sepia-900 dark:text-cream-100">{funnelData.tier3.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-cream-200/60 dark:bg-sepia-800 rounded-lg overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-readflow-gold rounded-md transition-all duration-500 min-w-3"
                      style={{ width: `${Math.max(6, funnelData.tier3.pct)}%` }}
                    />
                  </div>
                </div>

                {/* Tier 4 */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-readflow-green dark:text-readflow-lightgreen flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-readflow-green dark:bg-readflow-lightgreen animate-pulse" />
                      {funnelData.tier4.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {funnelData.tier4.value > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          ${funnelData.tier4.value >= 1000 ? `${Math.round(funnelData.tier4.value / 1000)}k` : funnelData.tier4.value}
                        </span>
                      )}
                      <span className="font-mono font-bold text-readflow-green dark:text-readflow-lightgreen">{funnelData.tier4.count}</span>
                    </div>
                  </div>
                  <div className="w-full h-4 bg-cream-200/60 dark:bg-sepia-800 rounded-lg overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-readflow-olive to-readflow-green dark:from-readflow-olive dark:to-readflow-lightgreen rounded-md transition-all duration-500 min-w-3"
                      style={{ width: `${Math.max(6, funnelData.tier4.pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Velocity Meter & Spotlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Velocity Meter */}
              <div className="p-3 rounded-xl bg-cream-50/50 dark:bg-sepia-850/70 border border-cream-200/70 dark:border-sepia-750 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cream-100 dark:bg-sepia-800 flex items-center justify-center text-readflow-gold dark:text-readflow-lightgold shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">Pipeline Velocity</span>
                  <div className="text-xs font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-1.5">
                    <span>~{funnelData.avgDays} Days Avg.</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-readflow-green/10 dark:bg-readflow-lightgreen/20 text-readflow-green dark:text-readflow-lightgreen">
                      {funnelData.avgDays <= 7 ? '⚡ High Momentum' : 'Steady Pacing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spotlight Category */}
              <div className="p-3 rounded-xl bg-cream-50/50 dark:bg-sepia-850/70 border border-cream-200/70 dark:border-sepia-750 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cream-100 dark:bg-sepia-800 flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-mono font-bold text-sepia-500 dark:text-cream-300 block">Top Win Rate</span>
                  <div className="text-xs font-bold text-sepia-900 dark:text-cream-100 truncate">
                    {funnelData.topCategory ? `${funnelData.topCategory.name} (${funnelData.topCategory.conversion}%)` : 'No wins yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : selectedCategory === 'All' ? (
          /* ALL CATEGORIES OVERVIEW CARDS */
          categoryStats.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="p-3 rounded-xl bg-cream-50/40 dark:bg-sepia-850/60 border border-cream-150 dark:border-sepia-750 hover:border-readflow-green/40 dark:hover:border-readflow-lightgreen/40 hover:bg-cream-50/80 dark:hover:bg-sepia-850 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${cat.badgeBg} ${cat.badgeBorder} ${cat.badgeText}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-serif font-bold text-sepia-900 dark:text-cream-100 group-hover:text-readflow-green dark:group-hover:text-readflow-lightgreen transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-sepia-400 dark:text-cream-300 font-mono">
                      ({cat.total})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen bg-cream-100 dark:bg-sepia-900 px-2 py-0.5 rounded-md font-mono border border-cream-200 dark:border-sepia-750">
                      {cat.conversion}% Conv.
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-sepia-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white dark:bg-sepia-900 p-1.5 rounded-lg border border-cream-200/80 dark:border-sepia-750">
                    <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block truncate">{cat.metric1Label}</span>
                    <span className="text-xs font-bold text-sepia-900 dark:text-cream-100 font-mono block mt-0.5">{cat.m1}</span>
                  </div>
                  <div className="bg-white dark:bg-sepia-900 p-1.5 rounded-lg border border-cream-200/80 dark:border-sepia-750">
                    <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block truncate">{cat.metric2Label}</span>
                    <span className="text-xs font-bold text-sepia-900 dark:text-cream-100 font-mono block mt-0.5">{cat.m2}</span>
                  </div>
                  <div className="bg-white dark:bg-sepia-900 p-1.5 rounded-lg border border-cream-200/80 dark:border-sepia-750">
                    <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block truncate">{cat.metric3Label}</span>
                    <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen font-mono block mt-0.5">{cat.m3}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : activeCategoryStat ? (
          /* SINGLE CATEGORY DETAIL DRILLDOWN */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-xl bg-cream-50/60 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-750">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${activeCategoryStat.badgeBg} ${activeCategoryStat.badgeBorder} ${activeCategoryStat.badgeText}`}>
                    {React.createElement(activeCategoryStat.icon, { className: 'w-4 h-4' })}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-sepia-900 dark:text-cream-100">
                      {activeCategoryStat.name} Funnel Breakdown
                    </h3>
                    <span className="text-[10px] text-sepia-500 dark:text-cream-300">
                      {activeCategoryStat.total} total opportunities logged
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-readflow-green dark:text-readflow-lightgreen">
                    {activeCategoryStat.conversion}%
                  </span>
                  <span className="text-[9px] text-sepia-400 dark:text-cream-300 block">Conversion</span>
                </div>
              </div>

              {/* Conversion Progress Bar */}
              <div className="w-full h-2 bg-cream-200 dark:bg-sepia-800 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-readflow-olive to-readflow-green dark:from-readflow-olive dark:to-readflow-lightgreen rounded-full transition-all duration-500"
                  style={{ width: `${activeCategoryStat.conversion}%` }}
                />
              </div>

              {/* 3 Metric Funnel Boxes */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white dark:bg-sepia-900 p-2.5 rounded-lg border border-cream-200 dark:border-sepia-750">
                  <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block">{activeCategoryStat.metric1Label}</span>
                  <span className="text-base font-bold text-sepia-900 dark:text-cream-100 font-mono block mt-1">{activeCategoryStat.m1}</span>
                </div>
                <div className="bg-white dark:bg-sepia-900 p-2.5 rounded-lg border border-cream-200 dark:border-sepia-750">
                  <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block">{activeCategoryStat.metric2Label}</span>
                  <span className="text-base font-bold text-sepia-900 dark:text-cream-100 font-mono block mt-1">{activeCategoryStat.m2}</span>
                </div>
                <div className="bg-white dark:bg-sepia-900 p-2.5 rounded-lg border border-cream-200 dark:border-sepia-750">
                  <span className="text-[9px] text-sepia-500 dark:text-cream-300 font-semibold block">{activeCategoryStat.metric3Label}</span>
                  <span className="text-base font-bold text-readflow-green dark:text-readflow-lightgreen font-mono block mt-1">{activeCategoryStat.m3}</span>
                </div>
              </div>
            </div>

            {/* Recent Logged Items in this Category */}
            <div>
              <h4 className="text-[11px] font-bold uppercase font-mono text-sepia-500 dark:text-cream-300 tracking-wider mb-2">
                Recent Opportunities in {activeCategoryStat.name}
              </h4>
              {activeCategoryStat.recentOpps.length === 0 ? (
                <p className="text-xs text-sepia-400 dark:text-cream-300 italic p-3 bg-cream-50/50 dark:bg-sepia-850 rounded-lg border border-cream-200/50 dark:border-sepia-750 text-center">
                  No opportunities logged in this category yet. Start logging above!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {activeCategoryStat.recentOpps.map((opp) => (
                    <div 
                      key={opp.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-sepia-900 border border-cream-200/80 dark:border-sepia-750 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-sepia-900 dark:text-cream-100 block truncate">{opp.title}</span>
                        <span className="text-[10px] text-sepia-400 dark:text-cream-300 font-mono">
                          {opp.type || 'Opportunity'} • {new Date(opp.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cream-100 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 border border-cream-200 dark:border-sepia-700 shrink-0">
                        {opp.stage || 'Sourced'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer Banner */}
      <div className="mt-3 text-[10px] text-sepia-500 dark:text-cream-300 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <Award className="w-3.5 h-3.5 text-readflow-gold dark:text-readflow-lightgold" />
        Funnel conversion: tracking live outbound seeds turning into real wins across all categories.
      </div>
    </div>
  );
};
