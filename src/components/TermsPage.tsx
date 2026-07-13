/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Scale, Compass, CheckCircle, FileText } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
  darkMode: boolean;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack, darkMode }) => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-sepia-950 text-stone-800 dark:text-cream-100 antialiased relative selection:bg-readflow-green/20 selection:text-readflow-green transition-colors duration-300">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-noise"></div>
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.4] pointer-events-none z-0" 
        style={{
          backgroundImage: `linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 sm:py-24">
        {/* Navigation / Header */}
        <button 
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-cream-300 hover:text-stone-900 dark:hover:text-cream-50 transition-colors mb-12 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-readflow-green/10 dark:bg-readflow-green/20 flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-cream-50 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-xs font-mono text-readflow-gold uppercase tracking-widest mt-1">
                Last updated: July 13, 2026
              </p>
            </div>
          </div>

          <p className="text-lg text-stone-600 dark:text-cream-300 font-light leading-relaxed">
            Welcome to the 1000 Opportunities tracker. By using this tool, you agree to these simple terms of use. Please read them carefully.
          </p>

          <hr className="border-stone-200 dark:border-sepia-800" />

          {/* Core Principles */}
          <div className="space-y-6 text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                1. Your Agreement
              </h3>
              <p>
                By accessing this tracking platform, you agree to use it as a personal helper tool. Since this app runs entirely inside your browser and saves data locally, you are fully in charge of managing your device and browser data safety.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                2. Data Ownership and Backup
              </h3>
              <p>
                You own all data you write into this tracker. We have no way to access, retrieve, or restore your logged records. We cannot be held responsible if you lose your progress by clearing your browser cache, changing devices, or reset settings. You are highly encouraged to use the manual "Export Backup" feature to download and secure copies of your records.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                3. Appropriate Use
              </h3>
              <p>
                This app is created for productivity tracking, personal motivation, and daily habit logbooks. You must not use this tool for any illegal purpose or attempt to modify its code to disrupt others' devices.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                4. Provided "As-Is"
              </h3>
              <p>
                We provide this tool for free with zero warranties or guarantees of any kind. We do not promise that the tracker will be completely error-free or uninterrupted. Any actions you take based on your tracked opportunities are done entirely at your own risk.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                5. Updates to These Terms
              </h3>
              <p>
                We may improve and update this tracker over time. If we make any changes to these simple rules, we will post the updated version on this page. By continuing to use the tracker, you agree to any new rules.
              </p>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <button 
              onClick={onBack}
              className="px-6 py-2.5 bg-stone-900 dark:bg-readflow-green text-white rounded-full text-xs font-semibold hover:bg-stone-800 dark:hover:bg-readflow-olive transition-all shadow cursor-pointer"
            >
              Accept and Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
