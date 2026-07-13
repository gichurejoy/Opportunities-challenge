/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScoreConfig } from '../types';
import { 
  Sparkles, 
  X, 
  Award, 
  Send, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { playNotificationChime } from './NudgeSettings';
import { CATEGORY_METADATA } from './QuickLogger';

interface NudgeToastProps {
  isOpen: boolean;
  message: string;
  scoreConfig: ScoreConfig;
  soundEnabled: boolean;
  onLogOpportunity: (title: string, category: string, type: string, points: number) => void;
  onClose: (actionTaken: boolean) => void;
}

export const NudgeToast: React.FC<NudgeToastProps> = ({
  isOpen,
  message,
  scoreConfig,
  soundEnabled,
  onLogOpportunity,
  onClose,
}) => {
  const [fastTitle, setFastTitle] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Career');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showLogForm, setShowLogForm] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [successText, setSuccessText] = useState<string>('');

  // Auto-play sound when toast opens
  useEffect(() => {
    if (isOpen && soundEnabled) {
      playNotificationChime();
    }
  }, [isOpen, soundEnabled]);

  const categories = Object.keys(scoreConfig);
  const availableTypes = Object.keys(scoreConfig[selectedCategory] || {});

  // Update selected type when category changes
  useEffect(() => {
    if (availableTypes.length > 0) {
      setSelectedType(availableTypes[0]);
    } else {
      setSelectedType('');
    }
  }, [selectedCategory, scoreConfig]);

  const handleFastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    const title = fastTitle.trim();
    if (!title) {
      setErrorText('Please describe your quick effort first!');
      return;
    }

    if (!selectedType) {
      setErrorText('No score metric configured for this category.');
      return;
    }

    const points = scoreConfig[selectedCategory][selectedType] || 1;
    
    onLogOpportunity(
      title,
      selectedCategory,
      selectedType,
      points
    );

    // Show success feedback
    setSuccessText(`Logged! +${points} pts`);
    setFastTitle('');
    
    setTimeout(() => {
      setSuccessText('');
      setShowLogForm(false);
      onClose(true); // Close with action taken
    }, 1500);
  };

  const currentMeta = CATEGORY_METADATA[selectedCategory] || {
    icon: Sparkles,
    color: '#3d617a',
    bg: 'bg-cream-50/50 dark:bg-sepia-900/40',
    border: 'border-cream-200 dark:border-sepia-800',
    text: 'text-sepia-800 dark:text-cream-100',
  };
  const CategoryIcon = currentMeta.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-white dark:bg-sepia-900 rounded-2xl border-2 border-readflow-green dark:border-readflow-lightgreen p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden font-sans">
            {/* Top gold bar effect */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-readflow-green via-readflow-gold to-readflow-green" />

            {/* Close button */}
            <button
              onClick={() => onClose(false)}
              className="absolute top-4 right-4 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-100 transition-all cursor-pointer p-0.5 rounded-full hover:bg-cream-100 dark:hover:bg-sepia-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Notification content */}
            <div className="flex items-start gap-3 mt-1">
              <div className="w-10 h-10 shrink-0 rounded-full bg-cream-50 dark:bg-sepia-850 border border-readflow-gold flex items-center justify-center shadow-inner text-readflow-gold animate-bounce">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <span className="text-[10px] font-bold text-readflow-green dark:text-readflow-lightgreen uppercase tracking-widest block font-mono">
                  🔥 MOMENTUM NUDGE
                </span>
                <h4 className="text-sm font-serif font-black text-sepia-900 dark:text-cream-150 mt-0.5 leading-snug">
                  {message}
                </h4>
              </div>
            </div>

            {/* Action Buttons */}
            {!showLogForm && !successText && (
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => setShowLogForm(true)}
                  className="flex-1 bg-readflow-green hover:bg-readflow-olive text-cream-100 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Log One Now!
                </button>
                <button
                  onClick={() => onClose(false)}
                  className="px-4 py-2 border border-cream-200 dark:border-sepia-800 text-sepia-500 dark:text-cream-300 font-bold rounded-xl text-xs hover:bg-cream-50 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Fast log entry form */}
            {showLogForm && !successText && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={fastFastSubmit => handleFastSubmit(fastFastSubmit)}
                className="border-t border-cream-150/60 dark:border-sepia-800/60 pt-3.5 space-y-3.5"
              >
                {/* Error Box */}
                {errorText && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorText}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wider block">
                    What did you achieve?
                  </label>
                  <input
                    id="fast-nudge-title-input"
                    type="text"
                    required
                    placeholder="e.g. Sent introductory call proposal to Acme VP"
                    value={fastTitle}
                    onChange={(e) => setFastTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/50 dark:bg-sepia-850/10 text-sepia-800 dark:text-cream-100 focus:outline-none placeholder-sepia-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wider block">
                      Category
                    </label>
                    <select
                      id="fast-nudge-category-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cream-50 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-800 rounded-xl text-[11px] font-bold text-sepia-800 dark:text-cream-100 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-sepia-400 dark:text-sepia-550 uppercase tracking-wider block">
                      Effort Metric
                    </label>
                    <select
                      id="fast-nudge-type-select"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-cream-50 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-800 rounded-xl text-[11px] font-bold text-sepia-800 dark:text-cream-100 focus:outline-none"
                    >
                      {availableTypes.map((type) => (
                        <option key={type} value={type}>{type} (+{scoreConfig[selectedCategory][type] || 0} pts)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="px-3 py-1.5 text-[11px] text-sepia-550 hover:bg-cream-100 dark:hover:bg-sepia-800 font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-readflow-green hover:bg-readflow-olive text-cream-100 font-bold px-4 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                  >
                    Log Effort <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Success state feedback */}
            {successText && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="w-10 h-10 text-readflow-green stroke-[2.5] animate-pulse" />
                <span className="text-sm font-serif font-black text-sepia-850 dark:text-cream-100">{successText}</span>
                <span className="text-[10px] text-sepia-450 dark:text-sepia-550 font-bold uppercase tracking-wider block">Momentum Preserved!</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
