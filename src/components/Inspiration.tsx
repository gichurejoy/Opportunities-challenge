/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Copy, Check, Heart, Play, Pause, RefreshCw } from 'lucide-react';

const INSPIRATION_QUOTES = [
  {
    text: "The best way to predict the future is to create it. In a world of 1,000 opportunities, initiative is your currency.",
    author: "1000 Opportunities Philosophy",
    category: "Initiative"
  },
  {
    text: "Every single connection, message, and small experiment is another seed planted in the garden of possibility.",
    author: "Growth Mindset",
    category: "Networking"
  },
  {
    text: "Do not wait for the perfect moment. Take the moment and make it one of your 1,000 steps toward greatness.",
    author: "Proactive Execution",
    category: "Action"
  },
  {
    text: "Abundance isn't something we acquire; it is something we tune into. Opportunity is everywhere once you start counting.",
    author: "Opportunity Awareness",
    category: "Mindset"
  },
  {
    text: "A single rejection is just one path closed; you have 999 more opportunities waiting to be forged.",
    author: "Resilience Protocol",
    category: "Resilience"
  },
  {
    text: "Success is a volume game. The more doors you knock on, the more luck finds you.",
    author: "The Law of High Numbers",
    category: "Volume"
  },
  {
    text: "Your next breakthrough is hiding behind the next bold email, the next proposed plan, or the next project.",
    author: "Career Progression",
    category: "Breakthrough"
  },
  {
    text: "Opportunities are like sunrises. If you wait too long, you miss them. Log your initiative today.",
    author: "Momentum Focus",
    category: "Urgency"
  },
  {
    text: "A vision without initiative is just a dream. Every small action today bridges the gap.",
    author: "Strategic Execution",
    category: "Vision"
  },
  {
    text: "Your professional density increases with every application, proposal, and conversation you start.",
    author: "1000 Opportunities Principle",
    category: "Impact"
  },
  {
    text: "Luck is what happens when preparation meets opportunity. Keep preparing, keep logging.",
    author: "Seneca (Adapted)",
    category: "Preparation"
  },
  {
    text: "Small daily improvements over time lead to stunning results. Never underestimate the power of +1.",
    author: "Continuous Compound Growth",
    category: "Compounding"
  }
];

export const Inspiration: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reflectedToday, setReflectedToday] = useState(false);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [fade, setFade] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const ROTATION_SECONDS = 20;

  // Load reflection count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('inspiration_reflections_count');
    if (savedCount) {
      setReflectionCount(parseInt(savedCount, 10));
    }

    const lastReflectedDate = localStorage.getItem('inspiration_last_reflected_date');
    const todayStr = new Date().toDateString();
    if (lastReflectedDate === todayStr) {
      setReflectedToday(true);
    }
  }, []);

  // Handle auto-rotation and progress bar
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Reset progress on quote change
    setProgress(0);

    const stepMs = 100;
    const totalSteps = (ROTATION_SECONDS * 1000) / stepMs;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const nextProgress = (currentStep / totalSteps) * 100;
      setProgress(Math.min(nextProgress, 100));
    }, stepMs);

    timerRef.current = setTimeout(() => {
      handleNext();
    }, ROTATION_SECONDS * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [index, isPaused]);

  const triggerFadeTransition = (newIndex: number) => {
    setFade(false);
    setTimeout(() => {
      setIndex(newIndex);
      setFade(true);
    }, 200);
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % INSPIRATION_QUOTES.length;
    triggerFadeTransition(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (index - 1 + INSPIRATION_QUOTES.length) % INSPIRATION_QUOTES.length;
    triggerFadeTransition(prevIdx);
  };

  const handleRandom = () => {
    let randomIdx = Math.floor(Math.random() * INSPIRATION_QUOTES.length);
    if (randomIdx === index) {
      randomIdx = (randomIdx + 1) % INSPIRATION_QUOTES.length;
    }
    triggerFadeTransition(randomIdx);
  };

  const handleCopy = async () => {
    const current = INSPIRATION_QUOTES[index];
    const textToCopy = `"${current.text}" — ${current.author} (#1000Opportunities)`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleReflect = () => {
    const todayStr = new Date().toDateString();
    if (reflectedToday) {
      // Toggle off
      setReflectedToday(false);
      const newCount = Math.max(0, reflectionCount - 1);
      setReflectionCount(newCount);
      localStorage.setItem('inspiration_reflections_count', String(newCount));
      localStorage.removeItem('inspiration_last_reflected_date');
    } else {
      // Toggle on
      setReflectedToday(true);
      const newCount = reflectionCount + 1;
      setReflectionCount(newCount);
      localStorage.setItem('inspiration_reflections_count', String(newCount));
      localStorage.setItem('inspiration_last_reflected_date', todayStr);
    }
  };

  const currentQuote = INSPIRATION_QUOTES[index];

  return (
    <div
      id="inspiration-widget"
      className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-5 shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[220px]"
    >
      {/* Dynamic progress bar tracking rotation */}
      <div className="absolute bottom-0 left-0 h-1 bg-readflow-gold/30 dark:bg-readflow-gold/20 w-full">
        <div
          className="h-full bg-readflow-gold dark:bg-readflow-gold transition-all duration-100 ease-linear"
          style={{ width: `${isPaused ? 0 : progress}%` }}
        />
      </div>

      <div>
        {/* Header section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-readflow-gold animate-pulse" />
            <span className="text-xs font-serif font-bold text-sepia-900 dark:text-cream-100">
              Daily Inspiration
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cream-100 dark:bg-sepia-800 text-sepia-600 dark:text-cream-300">
              {currentQuote.category}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Play Auto-rotate" : "Pause Auto-rotate"}
              className="p-1 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-50 dark:hover:bg-sepia-850 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quote body with smooth fade transitions */}
        <div className="relative min-h-[95px] flex flex-col justify-center">
          <span className="absolute -top-4 -left-2 text-6xl text-cream-200/60 dark:text-sepia-800/40 font-serif select-none">
            “
          </span>
          
          <div className={`transition-opacity duration-200 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-sm font-serif italic leading-relaxed text-sepia-800 dark:text-cream-150 pl-4 pr-2 relative z-10">
              {currentQuote.text}
            </p>
            <p className="text-right text-[11px] font-mono font-medium text-sepia-500 dark:text-sepia-400 mt-2 pr-2">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Interaction Controls */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream-100 dark:border-sepia-800 relative z-10">
        {/* Navigation & Utilities */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            title="Previous Quote"
            className="p-1.5 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-50 dark:hover:bg-sepia-850 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            title="Next Quote"
            className="p-1.5 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-50 dark:hover:bg-sepia-850 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRandom}
            title="Surprise Me"
            className="p-1.5 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-50 dark:hover:bg-sepia-850 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy Quote"}
            className="p-1.5 text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 rounded-lg hover:bg-cream-50 dark:hover:bg-sepia-850 transition-colors relative"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-readflow-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* "Reflected Today" action */}
        <div className="flex items-center gap-2">
          {reflectionCount > 0 && (
            <span className="text-[10px] font-mono text-sepia-400 dark:text-sepia-500">
              {reflectionCount} focus days
            </span>
          )}
          <button
            onClick={handleReflect}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-serif font-bold border transition-all ${
              reflectedToday
                ? 'bg-readflow-gold/10 border-readflow-gold text-readflow-gold'
                : 'border-cream-300 dark:border-sepia-750 text-sepia-400 hover:text-sepia-650 dark:hover:text-cream-200'
            }`}
          >
            <Heart className={`w-3 h-3 ${reflectedToday ? 'fill-readflow-gold text-readflow-gold' : ''}`} />
            {reflectedToday ? 'Reflected' : 'Reflect'}
          </button>
        </div>
      </div>
    </div>
  );
};
