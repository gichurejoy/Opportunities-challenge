/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Opportunity, Vision } from '../types';
import { Sparkles, HelpCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';

interface OneMoreButtonProps {
  visions: Vision[];
  recentOpportunities: Opportunity[];
  onLogOpportunity: (opportunity: Omit<Opportunity, 'id' | 'timestamp'>) => void;
}

export const OneMoreButton: React.FC<OneMoreButtonProps> = ({
  visions,
  recentOpportunities,
  onLogOpportunity,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'gemini' | 'fallback' | null>(null);
  const [messageIdx, setMessageIdx] = useState(0);

  const LOADING_MESSAGES = [
    "Consulting your long-term ambitions...",
    "Scanning career and business niches...",
    "Synthesizing high-leverage micro-actions...",
    "Preparing your next open door..."
  ];

  // Rotate loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setMessageIdx(0);
    try {
      const response = await fetch('/api/one-more', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visions: visions.map((v) => ({ title: v.title, description: v.description })),
          recentOpportunities: recentOpportunities.slice(0, 5).map((o) => ({ title: o.title, category: o.category, type: o.type })),
        }),
      });
      const data = await response.json();
      const newSuggestions = data.suggestions || [];
      const newSource = data.source || 'fallback';
      setSuggestions(newSuggestions);
      setSource(newSource);
      
      // Save to localStorage cache
      localStorage.setItem('one_more_suggestions', JSON.stringify(newSuggestions));
      localStorage.setItem('one_more_source', newSource);
    } catch (error) {
      console.error('Failed to fetch Gemini recommendations, utilizing defaults.', error);
      // Fail gracefully and use backup local defaults
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial suggestions on load using local cache if available
  useEffect(() => {
    const cached = localStorage.getItem('one_more_suggestions');
    const cachedSource = localStorage.getItem('one_more_source');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          setSuggestions(parsed);
          setSource((cachedSource as any) || 'gemini');
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached suggestions", e);
      }
    }
    // No valid cache available, perform initial fetch
    fetchSuggestions();
  }, []);

  const handleQuickLog = (item: any) => {
    onLogOpportunity({
      title: item.title,
      category: item.category,
      type: item.type || 'Smart Suggestion',
      points: item.points || 1,
      isSystemSuggestion: true,
    });
    // Remove the logged suggestion from list and update cache
    setSuggestions((prev) => {
      const next = prev.filter((s) => s.title !== item.title);
      localStorage.setItem('one_more_suggestions', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div id="one-more-panel" className="bg-white dark:bg-sepia-900 text-sepia-900 dark:text-cream-100 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col justify-between transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-readflow-gold fill-readflow-gold/20" />
            The "One More Opportunity" Catalyst
          </h2>
          <p className="text-xs text-sepia-500 dark:text-sepia-400 mt-0.5 font-medium">
            What's one small initiative you can take right now to create an open door?
          </p>
        </div>
        <button
          id="btn-refresh-one-more"
          disabled={loading}
          onClick={fetchSuggestions}
          className="flex items-center gap-1.5 text-xs font-bold bg-cream-100 hover:bg-cream-200 dark:bg-sepia-800 dark:hover:bg-sepia-700 px-3 py-1.5 rounded-lg border border-cream-200 dark:border-sepia-700 transition-all text-sepia-800 dark:text-cream-200 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Get New Options
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-sepia-500 dark:text-sepia-400 text-xs">
          <Loader2 className="w-8 h-8 text-readflow-green animate-spin mb-3" />
          <p className="font-semibold">{LOADING_MESSAGES[messageIdx]}</p>
        </div>
      ) : (
        <div className="flex-1">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-sepia-500 dark:text-sepia-450 italic text-xs flex flex-col items-center justify-center">
              <HelpCircle className="w-8 h-8 text-sepia-300 dark:text-sepia-700 mb-2" />
              <span>You conquered all suggested actions!</span>
              <button
                id="btn-re-fetch"
                onClick={fetchSuggestions}
                className="text-xs text-readflow-green dark:text-readflow-lightgreen font-bold mt-2 hover:underline cursor-pointer"
              >
                Generate more opportunities
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((item, idx) => {
                const meta = CATEGORY_METADATA[item.category] || CATEGORY_METADATA.Career;
                const Icon = meta.icon;
                return (
                  <div
                    key={idx}
                    id={`suggest-card-${idx}`}
                    className="p-4 rounded-xl border border-cream-200 dark:border-sepia-850 bg-cream-50/50 dark:bg-sepia-950/40 hover:bg-cream-100/50 dark:hover:bg-sepia-950/80 transition-all flex flex-col justify-between h-[180px] group"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${meta.text}`}>
                          <Icon className="w-3 h-3" />
                          {item.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold bg-cream-100 dark:bg-sepia-850 px-2 py-0.5 rounded text-sepia-700 dark:text-cream-200">
                          +{item.points} pts
                        </span>
                      </div>

                      {/* Title & description */}
                      <h3 className="text-xs font-bold text-sepia-800 dark:text-cream-100 group-hover:text-sepia-900 dark:group-hover:text-white line-clamp-2 leading-relaxed">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-sepia-500 dark:text-sepia-400 mt-1.5 line-clamp-3 leading-normal font-medium">
                        {item.description}
                      </p>
                    </div>

                    {/* Quick log trigger */}
                    <button
                      id={`log-suggest-btn-${idx}`}
                      onClick={() => handleQuickLog(item)}
                      className="w-full mt-3 bg-readflow-green hover:bg-readflow-olive text-cream-50 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Log This Initiative
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {source && (
        <div className="mt-3.5 border-t border-cream-150 dark:border-sepia-850 pt-2 text-[9px] text-sepia-400 dark:text-sepia-500 text-right">
          Suggestions powered by {source === 'gemini' ? 'Gemini 2.5 Flash' : 'Local Heuristic Engine'}
        </div>
      )}
    </div>
  );
};
