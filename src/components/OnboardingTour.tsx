/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Trophy, Zap, Target, ArrowRight, CheckCircle2, X } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onLogFirstOpportunity: (title: string, category: string, type: string, points: number) => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onLogFirstOpportunity }) => {
  const [step, setStep] = useState<number>(1);
  const [firstActionTitle, setFirstActionTitle] = useState<string>('');
  const [firstActionCategory, setFirstActionCategory] = useState<string>('Career');

  if (!isOpen) return null;

  const handleCompleteFirstSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstActionTitle.trim()) return;

    onLogFirstOpportunity(
      firstActionTitle.trim(),
      firstActionCategory,
      'Initial Action',
      5
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-cream-50 dark:bg-sepia-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden transform transition-all duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:text-cream-300 dark:hover:text-cream-50 rounded-full bg-cream-100 dark:bg-sepia-800 transition-colors z-10"
          title="Skip Tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header decoration */}
        <div className="p-6 pb-4 bg-gradient-to-r from-readflow-green via-readflow-olive to-stone-900 text-cream-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono font-bold tracking-widest text-readflow-gold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-readflow-gold" />
            Step {step} of 3 • Quick Walkthrough
          </div>
          <h2 className="text-2xl font-serif font-bold text-cream-50">
            {step === 1 && 'Welcome to 1,000 Opportunities!'}
            {step === 2 && 'How Scoring & Momentum Works'}
            {step === 3 && 'Log Your Very First Action!'}
          </h2>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-readflow-green/10 dark:bg-readflow-green/20 border border-readflow-green/20 rounded-2xl flex items-start gap-3">
                <Target className="w-6 h-6 text-readflow-green dark:text-readflow-gold shrink-0 mt-0.5" />
                <p className="text-xs text-sepia-900 dark:text-cream-100 leading-relaxed">
                  <strong className="font-bold">Core Philosophy:</strong> Your life changes when the number of proactive opportunities you create exceeds the number you wait for.
                </p>
              </div>

              <div className="space-y-3 text-xs text-stone-600 dark:text-cream-300 leading-relaxed font-light">
                <p>
                  Instead of passive to-do lists, this tracker empowers you to log <strong>1,000 high-leverage outbound actions</strong> (e.g. cold emails, job applications, code deployments, investment deposits).
                </p>
                <p>
                  Every log compounds your momentum, tracks daily streaks, and powers your long-term ambitions.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 bg-readflow-green hover:bg-readflow-olive text-white font-serif font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Next: Scoring Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl text-left">
                  <Zap className="w-4 h-4 text-readflow-gold mb-1" />
                  <h4 className="text-xs font-bold text-sepia-900 dark:text-cream-100">Points & Weights</h4>
                  <p className="text-[11px] text-stone-500 dark:text-cream-300 font-light mt-0.5">
                    High effort actions (e.g. Closing a client = 20 pts) award higher momentum.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl text-left">
                  <Trophy className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen mb-1" />
                  <h4 className="text-xs font-bold text-sepia-900 dark:text-cream-100">Streaks & Badges</h4>
                  <p className="text-[11px] text-stone-500 dark:text-cream-300 font-light mt-0.5">
                    Logging daily maintains streaks and unlocks achievement badges.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-cream-100 dark:bg-sepia-950/60 border border-cream-200 dark:border-sepia-800 rounded-xl text-xs text-stone-600 dark:text-cream-300">
                <p className="font-semibold text-sepia-900 dark:text-cream-100 mb-1">AI Catalyst Helper</p>
                <p className="text-[11px] leading-relaxed">
                  Stuck on what to do next? Click the <strong>"One More Opportunity"</strong> catalyst button on your dashboard anytime to generate personalized AI action ideas!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-cream-150 dark:bg-sepia-800 text-stone-600 dark:text-cream-200 font-serif text-xs font-bold rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 px-4 bg-readflow-green hover:bg-readflow-olive text-white font-serif font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>Ready to Log First Action!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteFirstSeed} className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-cream-300 font-light">
                What is one proactive outbound action you took today or plan to do right now?
              </p>

              <div>
                <label className="block text-xs font-serif font-semibold text-sepia-800 dark:text-cream-200 mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  value={firstActionTitle}
                  onChange={(e) => setFirstActionTitle(e.target.value)}
                  placeholder="e.g. Applied for 1 remote Software Engineer position"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl focus:ring-2 focus:ring-readflow-green focus:outline-none text-sepia-900 dark:text-cream-100"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-semibold text-sepia-800 dark:text-cream-200 mb-1">
                  Category
                </label>
                <select
                  value={firstActionCategory}
                  onChange={(e) => setFirstActionCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-sepia-950 border border-cream-200 dark:border-sepia-800 rounded-xl focus:ring-2 focus:ring-readflow-green focus:outline-none text-sepia-900 dark:text-cream-100"
                >
                  <option value="Career">Career</option>
                  <option value="Business">Business</option>
                  <option value="Learning">Learning</option>
                  <option value="Side Projects">Side Projects</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-readflow-green to-readflow-olive text-white font-serif font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-readflow-gold" />
                <span>Log First Action & Open Dashboard</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
