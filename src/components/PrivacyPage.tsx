/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Shield, Lock, EyeOff, Database } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
  darkMode: boolean;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, darkMode }) => {
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
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-cream-50 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs font-mono text-readflow-gold uppercase tracking-widest mt-1">
                Last updated: July 13, 2026
              </p>
            </div>
          </div>

          <p className="text-lg text-stone-600 dark:text-cream-300 font-light leading-relaxed">
            We believe your goals, ideas, and tracking records belong to you and no one else. Our privacy promise is simple: we do not collect, share, or see any of your data.
          </p>

          <hr className="border-stone-200 dark:border-sepia-800" />

          {/* Key Pillars */}
          <div className="grid gap-6 sm:grid-cols-3 py-4">
            <div className="bg-white dark:bg-sepia-900 p-5 rounded-xl border border-stone-200 dark:border-sepia-800">
              <Lock className="w-5 h-5 text-readflow-green dark:text-readflow-lightgreen mb-3" />
              <h3 className="font-serif font-semibold text-stone-900 dark:text-cream-50 mb-1">100% Local</h3>
              <p className="text-xs text-stone-500 dark:text-cream-300 leading-relaxed font-light">
                All opportunity tracker entries and settings stay on your own browser.
              </p>
            </div>
            <div className="bg-white dark:bg-sepia-900 p-5 rounded-xl border border-stone-200 dark:border-sepia-800">
              <EyeOff className="w-5 h-5 text-readflow-green dark:text-readflow-lightgreen mb-3" />
              <h3 className="font-serif font-semibold text-stone-900 dark:text-cream-50 mb-1">No Tracking</h3>
              <p className="text-xs text-stone-500 dark:text-cream-300 leading-relaxed font-light">
                No third-party trackers, cookies, analytics, or surveillance.
              </p>
            </div>
            <div className="bg-white dark:bg-sepia-900 p-5 rounded-xl border border-stone-200 dark:border-sepia-800">
              <Database className="w-5 h-5 text-readflow-green dark:text-readflow-lightgreen mb-3" />
              <h3 className="font-serif font-semibold text-stone-900 dark:text-cream-50 mb-1">Easy Backups</h3>
              <p className="text-xs text-stone-500 dark:text-cream-300 leading-relaxed font-light">
                You can save a backup file to your computer or clear your data anytime.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                How We Save Your Information
              </h3>
              <p>
                When you log your actions or customize your settings, that information is written directly to your web browser's storage (LocalStorage). This means the data is stored on your device, not on our servers.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                External Integrations
              </h3>
              <p>
                This application works entirely offline on your device. We do not use external trackers or share metrics. Your activities are kept quiet, fast, and completely safe from prying eyes.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                Data Erasure and Portability
              </h3>
              <p>
                You can back up your entire progress record by clicking the "Export Backup" button inside the data manager. If you wish to wipe all data, you can do so instantly by using the "Clear All Data" action. Clearing your browser cache or browser storage will also reset your progress, so we recommend exporting regular backups to keep your history safe.
              </p>
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-cream-50 mb-2">
                Contact
              </h3>
              <p>
                Since we do not collect your email address or any personal contact details, we have no way to send you unsolicited emails. For questions about this policy or to request help, you can contact us directly.
              </p>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <button 
              onClick={onBack}
              className="px-6 py-2.5 bg-stone-900 dark:bg-readflow-green text-white rounded-full text-xs font-semibold hover:bg-stone-800 dark:hover:bg-readflow-olive transition-all shadow cursor-pointer"
            >
              Return to Tracker Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
