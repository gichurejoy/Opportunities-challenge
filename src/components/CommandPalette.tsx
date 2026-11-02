/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  LayoutDashboard, 
  ClipboardList, 
  ListChecks, 
  GitBranch, 
  Sparkles, 
  Download, 
  Moon, 
  Sun, 
  ArrowRight, 
  FileText, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Laptop, 
  Rocket, 
  BookOpen, 
  Coins, 
  Activity, 
  Heart, 
  Sprout, 
  Command,
  Eye,
  Archive,
  Wand2,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';
import { Opportunity, OpportunityPipeline, Vision } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  pipelines: OpportunityPipeline[];
  visions: Vision[];
  onNavigate: (view: 'dashboard' | 'logbook' | 'checklist' | 'vision-details' | 'privacy' | 'terms') => void;
  onSelectPipeline?: (id: string) => void;
  onSelectVision?: (id: string) => void;
  onToggleDarkMode?: () => void;
  onExportCSV?: () => void;
  onQuickLogCategory?: (category: string) => void;
  onOpenAIParser?: () => void;
  onOpenCSVImport?: () => void;
  onOpenRoadmap?: () => void;
  darkMode?: boolean;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Opportunities' | 'Pipelines' | 'Visions' | 'Quick Log';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  opportunities,
  pipelines,
  visions,
  onNavigate,
  onSelectPipeline,
  onSelectVision,
  onToggleDarkMode,
  onExportCSV,
  onQuickLogCategory,
  onOpenAIParser,
  onOpenCSVImport,
  onOpenRoadmap,
  darkMode = false,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static Action Commands
  const actionCommands: CommandItem[] = useMemo(() => [
    {
      id: 'cmd-dashboard',
      category: 'Actions',
      title: 'Go to Dashboard',
      subtitle: 'Catalyst suggestions, roadmap & pipelines',
      icon: LayoutDashboard,
      action: () => { onNavigate('dashboard'); onClose(); },
    },
    {
      id: 'cmd-logbook',
      category: 'Actions',
      title: 'Open Opportunities Logbook',
      subtitle: 'View, filter, batch-edit, and audit all logs',
      icon: ClipboardList,
      badge: `${opportunities.length}`,
      action: () => { onNavigate('logbook'); onClose(); },
    },
    {
      id: 'cmd-checklist',
      category: 'Actions',
      title: 'Open Checklist Grid',
      subtitle: 'Daily consistency and habit trackers',
      icon: ListChecks,
      action: () => { onNavigate('checklist'); onClose(); },
    },
    {
      id: 'cmd-theme',
      category: 'Actions',
      title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: 'Toggle application theme appearance',
      icon: darkMode ? Sun : Moon,
      action: () => { onToggleDarkMode?.(); onClose(); },
    },
    {
      id: 'cmd-ai-parser',
      category: 'Actions',
      title: 'AI Opportunity Parser & Job Extractor',
      subtitle: 'Auto-extract title, salary, deadline & requirements from text or postings',
      icon: Wand2,
      badge: 'AI Pro',
      action: () => { onOpenAIParser?.(); onClose(); },
    },
    {
      id: 'cmd-roadmap',
      category: 'Actions',
      title: 'Road to 1,000 Gamified Roadmap',
      subtitle: 'Track milestone stations, sprint velocity & celebrate unlocks',
      icon: Trophy,
      badge: `${opportunities.length} / 1000`,
      action: () => { onOpenRoadmap?.(); onClose(); },
    },
    {
      id: 'cmd-csv-import',
      category: 'Actions',
      title: 'Import Opportunities from CSV / Excel',
      subtitle: 'Bulk upload spreadsheets with interactive column mapping',
      icon: FileSpreadsheet,
      action: () => { onOpenCSVImport?.(); onClose(); },
    },
    {
      id: 'cmd-export-csv',
      category: 'Actions',
      title: 'Export All Opportunities (CSV Backup)',
      subtitle: 'Download complete offline spreadsheet backup',
      icon: Download,
      action: () => { onExportCSV?.(); onClose(); },
    },
    {
      id: 'cmd-log-career',
      category: 'Quick Log',
      title: 'Log Career / Job Opportunity',
      subtitle: 'Quick log job application or fellowship',
      icon: Briefcase,
      badge: 'Career',
      action: () => { onNavigate('dashboard'); onQuickLogCategory?.('Career'); onClose(); },
    },
    {
      id: 'cmd-log-scholarship',
      category: 'Quick Log',
      title: 'Log Scholarship or Grant',
      subtitle: 'Quick log academic award or funding initiative',
      icon: GraduationCap,
      badge: 'Scholarship',
      action: () => { onNavigate('dashboard'); onQuickLogCategory?.('Scholarships'); onClose(); },
    },
    {
      id: 'cmd-log-business',
      category: 'Quick Log',
      title: 'Log Business Outreach / Lead',
      subtitle: 'Quick log B2B client pitch or contract lead',
      icon: Building,
      badge: 'Business',
      action: () => { onNavigate('dashboard'); onQuickLogCategory?.('Business'); onClose(); },
    },
    {
      id: 'cmd-log-sidework',
      category: 'Quick Log',
      title: 'Log Side Work / Freelance Gig',
      subtitle: 'Quick log consulting, contract or freelance quote',
      icon: Laptop,
      badge: 'Side Work',
      action: () => { onNavigate('dashboard'); onQuickLogCategory?.('Side Work'); onClose(); },
    },
  ], [onNavigate, onToggleDarkMode, onExportCSV, onQuickLogCategory, onOpenAIParser, onOpenCSVImport, onOpenRoadmap, darkMode, opportunities.length, onClose]);

  // Filtered Results
  const filteredItems: CommandItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Filtered Actions
    const matchedActions = actionCommands.filter((cmd) =>
      cmd.title.toLowerCase().includes(q) || (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q))
    );

    if (!q) {
      // If empty query, show top actions and recent opportunities/pipelines
      const recentOpps: CommandItem[] = opportunities.slice(0, 5).map((opp) => ({
        id: `opp-${opp.id}`,
        category: 'Opportunities',
        title: opp.title,
        subtitle: `${opp.category} • ${opp.type || 'Opportunity'}${opp.companyOrClient ? ` • ${opp.companyOrClient}` : ''}`,
        icon: FileText,
        badge: opp.stage || 'Sourced',
        action: () => {
          onNavigate('logbook');
          onClose();
        },
      }));

      const recentPipes: CommandItem[] = pipelines.slice(0, 3).map((pipe) => ({
        id: `pipe-${pipe.id}`,
        category: 'Pipelines',
        title: pipe.title,
        subtitle: `${pipe.type} • ${pipe.stages[pipe.currentStageIndex]?.name || 'Active'}`,
        icon: GitBranch,
        badge: pipe.status === 'won' ? 'Won 🎉' : 'In Motion',
        action: () => {
          onNavigate('dashboard');
          onSelectPipeline?.(pipe.id);
          onClose();
          setTimeout(() => {
            document.getElementById('pipeline-panel')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
      }));

      return [...matchedActions, ...recentOpps, ...recentPipes];
    }

    // 2. Filtered Opportunities
    const matchedOpps: CommandItem[] = opportunities
      .filter((opp) =>
        opp.title.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q) ||
        (opp.companyOrClient && opp.companyOrClient.toLowerCase().includes(q)) ||
        (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q)))
      )
      .slice(0, 8)
      .map((opp) => ({
        id: `opp-${opp.id}`,
        category: 'Opportunities',
        title: opp.title,
        subtitle: `${opp.category} • ${opp.companyOrClient || opp.type || 'Opportunity'}${opp.expectedValue ? ` • ${opp.expectedValue}` : ''}`,
        icon: FileText,
        badge: opp.stage || 'Sourced',
        action: () => {
          onNavigate('logbook');
          onClose();
        },
      }));

    // 3. Filtered Pipelines
    const matchedPipes: CommandItem[] = pipelines
      .filter((pipe) =>
        pipe.title.toLowerCase().includes(q) ||
        pipe.type.toLowerCase().includes(q) ||
        (pipe.companyOrClient && pipe.companyOrClient.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map((pipe) => ({
        id: `pipe-${pipe.id}`,
        category: 'Pipelines',
        title: pipe.title,
        subtitle: `${pipe.type} • Stage: ${pipe.stages[pipe.currentStageIndex]?.name || 'Active'}`,
        icon: GitBranch,
        badge: pipe.status,
        action: () => {
          onNavigate('dashboard');
          onSelectPipeline?.(pipe.id);
          onClose();
          setTimeout(() => {
            document.getElementById('pipeline-panel')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
      }));

    // 4. Filtered Visions
    const matchedVisions: CommandItem[] = visions
      .filter((v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((v) => ({
        id: `vision-${v.id}`,
        category: 'Visions',
        title: v.title,
        subtitle: `${v.completedPoints}/${v.targetPoints} points • ${v.isCompleted ? 'Goal Achieved' : 'In Progress'}`,
        icon: Award,
        badge: v.isCompleted ? 'Completed' : 'Roadmap',
        action: () => {
          onSelectVision?.(v.id);
          onClose();
        },
      }));

    return [...matchedActions, ...matchedOpps, ...matchedPipes, ...matchedVisions];
  }, [query, actionCommands, opportunities, pipelines, visions, onNavigate, onSelectPipeline, onSelectVision, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Keep highlighted item in view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-2xl bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-cream-150 dark:border-sepia-800 gap-3">
          <Search className="w-5 h-5 text-readflow-green dark:text-readflow-lightgreen shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search opportunities, pipelines, visions or type a command..."
            className="w-full bg-transparent text-sm font-medium text-sepia-900 dark:text-cream-100 placeholder-sepia-400 dark:placeholder-sepia-500 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-cream-100 dark:bg-sepia-800 text-sepia-600 dark:text-cream-300 rounded border border-cream-200 dark:border-sepia-700 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          className="flex-1 overflow-y-auto p-2 divide-y divide-cream-100 dark:divide-sepia-800/50 scrollbar-thin"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-sepia-400 dark:text-cream-300 italic space-y-1">
              <Search className="w-8 h-8 mx-auto text-cream-300 dark:text-sepia-750 mb-2 opacity-60" />
              <p>No matching commands, opportunities, or pipelines found.</p>
              <p className="text-[10px] text-sepia-400">Try searching by company, title, tag, or category.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const Icon = item.icon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  id={`cmd-item-${idx}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-readflow-green/10 dark:bg-readflow-green/20 text-sepia-900 dark:text-cream-50'
                      : 'text-sepia-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-sepia-850'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-readflow-green text-cream-50 dark:bg-readflow-lightgreen dark:text-sepia-950'
                        : 'bg-cream-100 dark:bg-sepia-800 text-sepia-600 dark:text-cream-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cream-150 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 border border-cream-200 dark:border-sepia-700 font-semibold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[10px] text-sepia-400 dark:text-cream-300 truncate font-sans">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-mono text-sepia-400 dark:text-sepia-500 uppercase tracking-wider hidden sm:inline">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-readflow-green dark:text-readflow-lightgreen' : 'text-sepia-300 dark:text-sepia-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-cream-50/70 dark:bg-sepia-850/80 border-t border-cream-150 dark:border-sepia-800 flex items-center justify-between text-[10px] font-mono text-sepia-500 dark:text-cream-300">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.2 bg-white dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 rounded shadow-2xs">↑</kbd> <kbd className="px-1 py-0.2 bg-white dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 rounded shadow-2xs">↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.2 bg-white dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 rounded shadow-2xs">↵</kbd> Select</span>
          </div>
          <span>1000 Opportunities Command Center</span>
        </div>
      </div>
    </div>
  );
};
