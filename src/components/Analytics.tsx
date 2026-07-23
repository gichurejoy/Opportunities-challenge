/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TrendingUp, Award, Briefcase, Building, GraduationCap, CheckCircle } from 'lucide-react';
import { Opportunity, OpportunityPipeline } from '../types';

interface AnalyticsProps {
  opportunities?: Opportunity[];
  pipelines?: OpportunityPipeline[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  opportunities = [],
  pipelines = [],
}) => {
  // Dynamically compute real funnel metrics from user database logs
  const metrics = useMemo(() => {
    // Career metrics
    const careerOpps = opportunities.filter((o) => o.category === 'Career');
    const careerApplied = careerOpps.filter((o) => ['Applied', 'Interviewing', 'Offer', 'Won 🎉'].includes(o.stage || '') || o.type.toLowerCase().includes('application')).length;
    const careerInterviewing = careerOpps.filter((o) => ['Interviewing', 'Offer', 'Won 🎉'].includes(o.stage || '')).length;
    const careerOffers = careerOpps.filter((o) => ['Offer', 'Won 🎉'].includes(o.stage || '')).length;
    const careerConversion = careerApplied > 0 ? Math.round((careerOffers / careerApplied) * 100) : 0;

    // Business metrics
    const bizOpps = opportunities.filter((o) => o.category === 'Business');
    const bizOutreach = bizOpps.length;
    const bizMeetings = bizOpps.filter((o) => ['Contacted', 'Interviewing', 'Won 🎉'].includes(o.stage || '')).length;
    const bizDealsWon = pipelines.filter((p) => p.status === 'won').length;
    const bizConversion = bizOutreach > 0 ? Math.round((bizDealsWon / bizOutreach) * 100) : 0;

    // Learning & Grants metrics
    const learningOpps = opportunities.filter((o) => o.category === 'Learning');
    const learningTotal = learningOpps.length;
    const learningCompleted = learningOpps.filter((o) => o.stage === 'Completed' || o.stage === 'Won 🎉').length;
    const learningConversion = learningTotal > 0 ? Math.round((learningCompleted / learningTotal) * 100) : 0;

    return {
      career: { applied: careerApplied, interviewing: careerInterviewing, offers: careerOffers, conversion: careerConversion },
      business: { outreach: bizOutreach, meetings: bizMeetings, won: bizDealsWon, conversion: bizConversion },
      learning: { total: learningTotal, completed: learningCompleted, conversion: learningConversion },
    };
  }, [opportunities, pipelines]);

  return (
    <div id="analytics-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300">
      <div>
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-readflow-gold" />
          Opportunity Analytics
        </h2>
        <p className="text-xs text-sepia-400 dark:text-sepia-500 mb-4 font-sans font-medium">
          Live conversion metrics calculated automatically from your real logged data.
        </p>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {/* Career & Jobs */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif font-bold text-sepia-800 dark:text-cream-200 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-readflow-green" />
              Career & Applications
            </span>
            <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {metrics.career.conversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Applications</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5 block">{metrics.career.applied}</span>
            </div>
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Interviews</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5 block">{metrics.career.interviewing}</span>
            </div>
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Offers Received</span>
              <span className="text-sm font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5 block">{metrics.career.offers}</span>
            </div>
          </div>
        </div>

        {/* Business Outreach */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif font-bold text-sepia-800 dark:text-cream-200 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-readflow-gold" />
              Business & Sales Funnel
            </span>
            <span className="text-xs font-bold text-readflow-olive dark:text-readflow-gold bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {metrics.business.conversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Outreach Logs</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5 block">{metrics.business.outreach}</span>
            </div>
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Meetings/Calls</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5 block">{metrics.business.meetings}</span>
            </div>
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Deals Won</span>
              <span className="text-sm font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5 block">{metrics.business.won}</span>
            </div>
          </div>
        </div>

        {/* Learning & Skill Mastery */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif font-bold text-sepia-800 dark:text-cream-200 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-readflow-olive" />
              Learning & Skill Completion
            </span>
            <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {metrics.learning.conversion}% Complete
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Total Learning Logs</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5 block">{metrics.learning.total}</span>
            </div>
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold block">Completed Milestones</span>
              <span className="text-sm font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5 block">{metrics.learning.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <Award className="w-3 h-3 text-readflow-gold" />
        Funnel conversion: tracking live outbound seeds turning into real wins.
      </div>
    </div>
  );
};
