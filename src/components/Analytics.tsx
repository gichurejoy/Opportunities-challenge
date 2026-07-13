/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Plus, Minus, ArrowRight, Award } from 'lucide-react';

export const Analytics: React.FC = () => {
  // We make these stateful so users can interactively update their funnel stats and see their conversions shift!
  const [jobApps, setJobApps] = useState(42);
  const [jobInterviews, setJobInterviews] = useState(9);
  const [jobOffers, setJobOffers] = useState(2);

  const [coldEmails, setColdEmails] = useState(130);
  const [replies, setReplies] = useState(34);
  const [meetings, setMeetings] = useState(12);
  const [clients, setClients] = useState(4);

  const [scholarshipApps, setScholarshipApps] = useState(10);
  const [scholarshipInterviews, setScholarshipInterviews] = useState(3);
  const [scholarshipAccepted, setScholarshipAccepted] = useState(1);

  // Calculate percentages
  const jobConversion = jobApps > 0 ? Math.round((jobOffers / jobApps) * 100) : 0;
  const businessConversion = coldEmails > 0 ? Math.round((clients / coldEmails) * 100) : 0;
  const scholarshipConversion = scholarshipApps > 0 ? Math.round((scholarshipAccepted / scholarshipApps) * 100) : 0;

  return (
    <div id="analytics-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300">
      <div>
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-readflow-gold" />
          Opportunity Analytics
        </h2>
        <p className="text-xs text-sepia-400 dark:text-sepia-500 mb-4 font-sans font-medium">
          How many micro-initiatives converted into tangible milestones?
        </p>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {/* Job Applications */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sepia-700 dark:text-cream-200">Career & Jobs</span>
            <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {jobConversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Stat 1 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Applications</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{jobApps}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setJobApps(Math.max(0, jobApps - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setJobApps(jobApps + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Interviews</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{jobInterviews}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setJobInterviews(Math.max(0, jobInterviews - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setJobInterviews(jobInterviews + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Job Offers</span>
              <span className="text-sm font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5">{jobOffers}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setJobOffers(Math.max(0, jobOffers - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setJobOffers(jobOffers + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Outreach */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sepia-700 dark:text-cream-200">Business & Agency Sales</span>
            <span className="text-xs font-bold text-readflow-olive dark:text-readflow-gold bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {businessConversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {/* Stat 1 */}
            <div className="bg-white dark:bg-sepia-900/60 p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[8px] text-sepia-400 dark:text-sepia-500 font-semibold truncate w-full">Cold Emails</span>
              <span className="text-xs font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{coldEmails}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setColdEmails(Math.max(0, coldEmails - 5))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer text-[8px] font-bold">-5</button>
                <button onClick={() => setColdEmails(coldEmails + 5)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer text-[8px] font-bold">+5</button>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="bg-white dark:bg-sepia-900/60 p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[8px] text-sepia-400 dark:text-sepia-500 font-semibold truncate w-full">Replies</span>
              <span className="text-xs font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{replies}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setReplies(Math.max(0, replies - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-2.5 h-2.5" /></button>
                <button onClick={() => setReplies(replies + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-2.5 h-2.5" /></button>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white dark:bg-sepia-900/60 p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[8px] text-sepia-400 dark:text-sepia-500 font-semibold truncate w-full">Meetings</span>
              <span className="text-xs font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{meetings}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setMeetings(Math.max(0, meetings - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-2.5 h-2.5" /></button>
                <button onClick={() => setMeetings(meetings + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-2.5 h-2.5" /></button>
              </div>
            </div>
            {/* Stat 4 */}
            <div className="bg-white dark:bg-sepia-900/60 p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[8px] text-sepia-400 dark:text-sepia-500 font-semibold truncate w-full">Clients Won</span>
              <span className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5">{clients}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setClients(Math.max(0, clients - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-2.5 h-2.5" /></button>
                <button onClick={() => setClients(clients + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-2.5 h-2.5" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Scholarships */}
        <div className="p-3.5 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sepia-700 dark:text-cream-200">Scholarships & Grants</span>
            <span className="text-xs font-bold text-readflow-olive dark:text-readflow-gold bg-cream-100 dark:bg-sepia-950/40 px-2.5 py-0.5 rounded-md font-mono">
              {scholarshipConversion}% Conv.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Stat 1 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Applications</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{scholarshipApps}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setScholarshipApps(Math.max(0, scholarshipApps - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setScholarshipApps(scholarshipApps + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            {/* Stat 2 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Interviews</span>
              <span className="text-sm font-bold text-sepia-800 dark:text-cream-100 font-mono mt-0.5">{scholarshipInterviews}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setScholarshipInterviews(Math.max(0, scholarshipInterviews - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setScholarshipInterviews(scholarshipInterviews + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white dark:bg-sepia-900/60 p-2 rounded-lg border border-cream-200 dark:border-sepia-800/60 flex flex-col justify-between items-center">
              <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-semibold">Accepted</span>
              <span className="text-sm font-bold text-readflow-green dark:text-readflow-lightgreen font-mono mt-0.5">{scholarshipAccepted}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => setScholarshipAccepted(Math.max(0, scholarshipAccepted - 1))} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Minus className="w-3 h-3" /></button>
                <button onClick={() => setScholarshipAccepted(scholarshipAccepted + 1)} className="p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-650 cursor-pointer"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <Award className="w-3 h-3 text-readflow-gold" />
        Funnel conversion: tracking small seeds turning into big achievements.
      </div>
    </div>
  );
};
