/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { localDb, AppState } from './utils/localDb';
import { Opportunity, OpportunityPipeline, ScoreConfig, Vision, ChecklistHabit, NudgeConfig } from './types';
import { QuickLogger } from './components/QuickLogger';
import { Inspiration } from './components/Inspiration';
import { Heatmap } from './components/Heatmap';
import { Pipeline } from './components/Pipeline';
import { Analytics } from './components/Analytics';
import { Visions } from './components/Visions';
import { Streaks } from './components/Streaks';
import { WeeklyReview } from './components/WeeklyReview';
import { Vault } from './components/Vault';
import { ScoreSettings } from './components/ScoreSettings';
import { OneMoreButton } from './components/OneMoreButton';
import { OpportunitiesLogbook } from './components/OpportunitiesLogbook';
import { ChecklistGrid } from './components/ChecklistGrid';
import { VisionDetails } from './components/VisionDetails';
import { NudgeSettings } from './components/NudgeSettings';
import { NudgeToast } from './components/NudgeToast';
import { LandingPage } from './components/LandingPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingTour } from './components/OnboardingTour';
import { BadgesModal } from './components/BadgesModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { QuickTemplates } from './components/QuickTemplates';
import { User, api, authStorage } from './utils/api';
import { Sparkles, Trophy, Settings, Archive, Star, CheckCircle, Info, Sun, Moon, LayoutDashboard, ClipboardList, ListChecks, BellRing, Home, LogIn, LogOut, User as UserIcon, Cloud, Database, Printer, Award, HelpCircle } from 'lucide-react';


export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'logbook' | 'checklist' | 'vision-details' | 'privacy' | 'terms'>('dashboard');
  const [selectedVisionId, setSelectedVisionId] = useState<string | null>(null);
  const [activePipelineId, setActivePipelineId] = useState<string>('');
  const [activeBottomTab, setActiveBottomTab] = useState<'vault' | 'settings' | 'nudge'>('vault');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load state and authenticate user on mount
  useEffect(() => {
    async function initAuthAndState() {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const dbState = await api.loadStateFromDb();
        if (dbState) {
          setState(dbState);
          return;
        }
      }
      setState(localDb.loadState());
    }
    initAuthAndState();
  }, []);

  // Sync state to localDb and DB (if authenticated) on updates
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      localDb.saveState(next);
      if (authStorage.getToken()) {
        api.saveStateToDb(next).catch(err => console.error('Cloud state sync error:', err));
      }
      return next;
    });
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    const dbState = await api.loadStateFromDb();
    if (dbState) {
      setState(dbState);
      if ((dbState.opportunities || []).length === 0) {
        setIsOnboardingOpen(true);
      }
    } else if (state) {
      await api.saveStateToDb(state);
      if ((state.opportunities || []).length === 0) {
        setIsOnboardingOpen(true);
      }
    }
  };

  const handleSignOut = () => {
    authStorage.removeToken();
    setCurrentUser(null);
  };


  // 1. Log a new opportunity
  const handleLogOpportunity = (newOpp: Omit<Opportunity, 'id' | 'timestamp'> & { timestamp?: string }) => {
    updateState((prev) => {
      const id = `opp-${Date.now()}`;
      const timestamp = newOpp.timestamp || new Date().toISOString();
      const todayStr = timestamp.split('T')[0];

      // Auto-assign point weights from active scoreConfig if not set manually
      let points = newOpp.points;
      if (points === 0) {
        points = prev.scoreConfig[newOpp.category]?.[newOpp.type] || 1;
      }

      const loggedOpp: Opportunity = {
        ...newOpp,
        id,
        timestamp,
        points,
      };

      const nextOpps = [loggedOpp, ...prev.opportunities];

      // Update streaks dynamically
      const nextStreakStates = { ...prev.streakStates };
      
      // Update general Opportunity Streak (any log today increases it)
      const oppState = nextStreakStates.opportunity || { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
      if (oppState.lastActiveDate !== todayStr) {
        const isYesterday = oppState.lastActiveDate === getOffsetDateOnly(-1);
        const nextStreak = isYesterday ? oppState.currentStreak + 1 : 1;
        nextStreakStates.opportunity = {
          currentStreak: nextStreak,
          longestStreak: Math.max(oppState.longestStreak, nextStreak),
          lastActiveDate: todayStr,
        };
      }

      // Helper for auxiliary streaks
      const checkAndIncrementAuxStreak = (streakId: string, isTriggered: boolean) => {
        if (!isTriggered) return;
        const streakState = nextStreakStates[streakId] || { currentStreak: 0, longestStreak: 0, lastActiveDate: '' };
        if (streakState.lastActiveDate !== todayStr) {
          const isYesterday = streakState.lastActiveDate === getOffsetDateOnly(-1);
          const nextStreak = isYesterday ? streakState.currentStreak + 1 : 1;
          nextStreakStates[streakId] = {
            currentStreak: nextStreak,
            longestStreak: Math.max(streakState.longestStreak, nextStreak),
            lastActiveDate: todayStr,
          };
        }
      };

      // Check category triggers
      checkAndIncrementAuxStreak('reading', newOpp.category === 'Learning' && (newOpp.type.includes('Read') || newOpp.type.includes('Book')));
      checkAndIncrementAuxStreak('savings', newOpp.category === 'Finance' && (newOpp.type.includes('Saved') || newOpp.type.includes('Invest')));
      checkAndIncrementAuxStreak('fitness', newOpp.category === 'Health' && (newOpp.type.includes('Workout') || newOpp.type.includes('Walk')));
      checkAndIncrementAuxStreak('coding', (newOpp.category === 'Learning' || newOpp.category === 'Side Projects') && (newOpp.type.includes('Coding') || newOpp.type.includes('Commit') || newOpp.type.includes('Project')));

      // Dynamically recalculate completed points on all active visions
      const nextVisions = prev.visions.map((vision) => {
        // Find opportunities matching this vision's supporting categories, types, or explicit links
        const supportingLogs = nextOpps.filter((opp) => {
          if (opp.linkedVisionId === vision.id) return true;
          const matchesCategory = vision.supportingCategories.includes(opp.category);
          const matchesType = vision.supportingTypes.includes(opp.type);
          return matchesCategory || matchesType;
        });
        const completedPoints = supportingLogs.reduce((sum, opp) => sum + opp.points, 0);
        return {
          ...vision,
          completedPoints,
          isCompleted: completedPoints >= vision.targetPoints,
        };
      });

      return {
        ...prev,
        opportunities: nextOpps,
        streakStates: nextStreakStates,
        visions: nextVisions,
      };
    });
  };

  const getOffsetDateOnly = (daysOffset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  // 2. Delete an opportunity
  const handleDeleteOpportunity = (id: string) => {
    updateState((prev) => {
      const nextOpps = prev.opportunities.filter((o) => o.id !== id);

      // Recalculate visions
      const nextVisions = prev.visions.map((vision) => {
        const supportingLogs = nextOpps.filter((opp) => {
          if (opp.linkedVisionId === vision.id) return true;
          const matchesCategory = vision.supportingCategories.includes(opp.category);
          const matchesType = vision.supportingTypes.includes(opp.type);
          return matchesCategory || matchesType;
        });
        const completedPoints = supportingLogs.reduce((sum, opp) => sum + opp.points, 0);
        return {
          ...vision,
          completedPoints,
          isCompleted: completedPoints >= vision.targetPoints,
        };
      });

      return {
        ...prev,
        opportunities: nextOpps,
        visions: nextVisions,
      };
    });
  };

  // 2.5 Update an opportunity
  const handleUpdateOpportunity = (updatedOpp: Opportunity) => {
    updateState((prev) => {
      const nextOpps = prev.opportunities.map((o) => (o.id === updatedOpp.id ? updatedOpp : o));

      // Dynamically recalculate completed points on all active visions
      const nextVisions = prev.visions.map((vision) => {
        const supportingLogs = nextOpps.filter((opp) => {
          if (opp.linkedVisionId === vision.id) return true;
          const matchesCategory = vision.supportingCategories.includes(opp.category);
          const matchesType = vision.supportingTypes.includes(opp.type);
          return matchesCategory || matchesType;
        });
        const completedPoints = supportingLogs.reduce((sum, opp) => sum + opp.points, 0);
        return {
          ...vision,
          completedPoints,
          isCompleted: completedPoints >= vision.targetPoints,
        };
      });

      return {
        ...prev,
        opportunities: nextOpps,
        visions: nextVisions,
      };
    });
  };

  // 3. Add Opportunity Pipeline
  const handleAddPipeline = (newPipe: Omit<OpportunityPipeline, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateState((prev) => {
      const pipe: OpportunityPipeline = {
        ...newPipe,
        id: `pipe-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        pipelines: [pipe, ...prev.pipelines],
      };
    });
  };

  // 4. Update Opportunity Pipeline
  const handleUpdatePipeline = (updatedPipe: OpportunityPipeline) => {
    updateState((prev) => {
      const nextPipes = prev.pipelines.map((p) => (p.id === updatedPipe.id ? updatedPipe : p));
      return {
        ...prev,
        pipelines: nextPipes,
      };
    });
  };

  // 5. Delete Opportunity Pipeline
  const handleDeletePipeline = (id: string) => {
    updateState((prev) => ({
      ...prev,
      pipelines: prev.pipelines.filter((p) => p.id !== id),
    }));
  };

  // 6. Update Score weights config
  const handleUpdateScoreConfig = (config: ScoreConfig) => {
    updateState((prev) => ({
      ...prev,
      scoreConfig: config,
    }));
  };

  // 7. Reset scores to system defaults
  const handleResetScores = () => {
    updateState((prev) => ({
      ...prev,
      scoreConfig: localDb.loadState().scoreConfig,
    }));
  };

  // 7b. Update weekly target count dynamically
  const handleUpdateWeeklyTarget = (weekStarting: string, targetCount: number) => {
    updateState((prev) => {
      const targets = [...(prev.weeklyTargets || [])];
      const existingIdx = targets.findIndex((t) => t.weekStarting === weekStarting);
      if (existingIdx > -1) {
        targets[existingIdx] = {
          ...targets[existingIdx],
          targetCount,
        };
      } else {
        targets.push({
          weekStarting,
          targetCount,
          completedCount: 0,
        });
      }
      return {
        ...prev,
        weeklyTargets: targets,
      };
    });
  };

  // Custom Time-based Momentum Nudges State
  const [activeNudge, setActiveNudge] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const lastTriggeredRef = useRef<string>('');

  const handleUpdateNudgeConfig = (config: NudgeConfig) => {
    updateState((prev) => ({
      ...prev,
      nudgeConfig: config,
    }));
  };

  const handleTriggerTestNudge = (msg: string) => {
    setActiveNudge({
      isOpen: true,
      message: msg || "What's one more opportunity you can create today?",
    });

    // Add to audit logs
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: msg || "What's one more opportunity you can create today?",
      actionTaken: false,
    };

    updateState((prev) => {
      const config = prev.nudgeConfig || { enabled: true, soundEnabled: true, browserNotificationsEnabled: false, schedules: [], history: [] };
      return {
        ...prev,
        nudgeConfig: {
          ...config,
          history: [...(config.history || []), newLog],
        },
      };
    });

    if (state?.nudgeConfig?.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("Momentum Nudge (Test)", {
          body: msg || "What's one more opportunity you can create today?",
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.error('Failed to trigger native notification', e);
      }
    }
  };

  const handleCloseNudge = (actionTaken: boolean) => {
    setActiveNudge({ isOpen: false, message: '' });
    if (actionTaken) {
      updateState((prev) => {
        const config = prev.nudgeConfig || { enabled: true, soundEnabled: true, browserNotificationsEnabled: false, schedules: [], history: [] };
        const history = [...(config.history || [])];
        if (history.length > 0) {
          history[history.length - 1] = {
            ...history[history.length - 1],
            actionTaken: true,
          };
        }
        return {
          ...prev,
          nudgeConfig: {
            ...config,
            history,
          },
        };
      });
    }
  };

  // Nudge schedule polling effect
  useEffect(() => {
    if (!state || !state.nudgeConfig?.enabled) return;

    const checkSchedules = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hrs}:${mins}`;

      if (lastTriggeredRef.current === timeStr) return;

      const schedules = state.nudgeConfig?.schedules || [];
      const activeMatch = schedules.find((s) => s.enabled && s.time === timeStr);

      if (activeMatch) {
        lastTriggeredRef.current = timeStr;
        setActiveNudge({
          isOpen: true,
          message: activeMatch.message,
        });

        // Add to logs
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          message: activeMatch.message,
          actionTaken: false,
        };

        updateState((prev) => {
          const config = prev.nudgeConfig || { enabled: true, soundEnabled: true, browserNotificationsEnabled: false, schedules: [], history: [] };
          return {
            ...prev,
            nudgeConfig: {
              ...config,
              history: [...(config.history || []), newLog],
            },
          };
        });

        if (state.nudgeConfig?.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification("Opportunity Momentum Nudge", {
              body: activeMatch.message,
              icon: '/favicon.ico'
            });
          } catch (e) {
            console.error('Failed to trigger native notification', e);
          }
        }
      }
    };

    const intervalId = setInterval(checkSchedules, 10000);
    checkSchedules();

    return () => clearInterval(intervalId);
  }, [state, state?.nudgeConfig?.enabled, state?.nudgeConfig?.schedules]);

  // 8. Add Checklist Habit
  const handleAddChecklistHabit = (newHabit: Omit<ChecklistHabit, 'id'>) => {
    updateState((prev) => {
      const habit: ChecklistHabit = {
        ...newHabit,
        id: `hab-${Date.now()}`,
      };
      return {
        ...prev,
        checklistHabits: [...(prev.checklistHabits || []), habit],
      };
    });
  };

  // 9. Delete Checklist Habit
  const handleDeleteChecklistHabit = (id: string) => {
    updateState((prev) => ({
      ...prev,
      checklistHabits: (prev.checklistHabits || []).filter((h) => h.id !== id),
    }));
  };

  // 8. Add Vision ambition
  const handleAddVision = (newVision: Omit<Vision, 'id' | 'completedPoints' | 'isCompleted'>) => {
    updateState((prev) => {
      // Calculate current supporting points for the new vision
      const supportingLogs = prev.opportunities.filter((opp) => {
        const matchesCategory = newVision.supportingCategories.includes(opp.category);
        const matchesType = newVision.supportingTypes.includes(opp.type);
        return matchesCategory || matchesType;
      });
      const completedPoints = supportingLogs.reduce((sum, opp) => sum + opp.points, 0);

      const vision: Vision = {
        ...newVision,
        id: `vision-${Date.now()}`,
        completedPoints,
        isCompleted: completedPoints >= newVision.targetPoints,
      };

      return {
        ...prev,
        visions: [...prev.visions, vision],
      };
    });
  };

  // 9. Toggle complete vision manually
  const handleToggleVisionComplete = (id: string) => {
    updateState((prev) => ({
      ...prev,
      visions: prev.visions.map((v) => (v.id === id ? { ...v, isCompleted: !v.isCompleted } : v)),
    }));
  };

  // 10. Delete vision
  const handleDeleteVision = (id: string) => {
    updateState((prev) => ({
      ...prev,
      visions: prev.visions.filter((v) => v.id !== id),
    }));
  };

  // 11. Toggle streak active state
  const handleToggleStreakActive = (id: string) => {
    updateState((prev) => ({
      ...prev,
      streaks: prev.streaks.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    }));
  };

  // 12. Import entire Vault from backup
  const handleImportVault = (importedState: any) => {
    updateState((prev) => ({
      ...prev,
      opportunities: importedState.opportunities || prev.opportunities,
      streakStates: importedState.streakStates || prev.streakStates,
      visions: importedState.visions || prev.visions,
      pipelines: importedState.pipelines || prev.pipelines,
    }));
  };

  // 13. Clear and Reset Vault to defaults
  const handleClearVault = () => {
    setState(localDb.resetState());
  };

  // State guards
  if (!state) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-sepia-950 flex flex-col items-center justify-center text-sepia-500 font-sans">
        <Loader2 className="w-8 h-8 text-readflow-green dark:text-readflow-lightgreen animate-spin mb-3" />
        <span className="text-xs font-mono font-bold tracking-wider">Engaging the challenge...</span>
      </div>
    );
  }

  // Filter today's opportunities logs
  const todayOpportunities = state.opportunities.filter((opp) => {
    const oppDate = opp.timestamp.split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    return oppDate === todayStr;
  });

  const totalOppsCount = state.opportunities.length;
  const challengeProgressPercent = Math.min(100, Math.round((totalOppsCount / 1000) * 100));

  // Authentication Guard: Require sign in / creation to access dashboard
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onEnterApp={() => setIsAuthModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          totalOppsCount={totalOppsCount}
          scoreConfig={state.scoreConfig}
          onLogOpportunity={handleLogOpportunity}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-sepia-950 text-sepia-900 dark:text-cream-100 font-sans flex flex-col transition-colors duration-300">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 bg-white dark:bg-sepia-900 border-b border-cream-200 dark:border-sepia-800 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-readflow-green dark:bg-readflow-olive rounded-lg flex items-center justify-center text-cream-100 font-serif font-bold text-xl shadow-sm">
                O
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight text-sepia-900 dark:text-cream-100 leading-none">
                  1000 Opportunities
                </h1>
                <span className="text-[10px] font-mono font-bold text-readflow-olive dark:text-readflow-gold uppercase tracking-widest block mt-1">
                  Your future is created, not awaited
                </span>
              </div>
            </div>
            
            {/* Mobile Nav Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={() => setIsBadgesOpen(true)}
                className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 transition-all cursor-pointer"
                title="View Milestone Badges"
              >
                <Award className="w-4 h-4 text-amber-500" />
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-2 rounded-lg bg-readflow-green/10 dark:bg-readflow-green/20 border border-readflow-green/20 text-readflow-green dark:text-readflow-lightgreen transition-all cursor-pointer"
                title="Generate Weekly Catalyst Report"
              >
                <Printer className="w-4 h-4 text-readflow-gold" />
              </button>

              <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 shadow-sm">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name || 'User'} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                    {(currentUser.name || currentUser.email)[0]}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-1 text-sepia-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-700 dark:text-cream-200 hover:bg-cream-150 dark:hover:bg-sepia-750 transition-all cursor-pointer"
                title="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Core Counter Progress Bar */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-cream-150 dark:border-sepia-800 pt-4 md:pt-0">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-widest">Total Progress</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-mono font-bold text-sepia-800 dark:text-cream-100">{totalOppsCount} / 1000</span>
                  <div className="w-32 sm:w-48 h-2 bg-cream-150 dark:bg-sepia-800 rounded-full overflow-hidden border border-cream-200 dark:border-sepia-700">
                    <div
                      className="h-full bg-readflow-green dark:bg-readflow-lightgreen transition-all duration-500"
                      style={{ width: `${challengeProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-cream-50 dark:bg-sepia-800 border-2 border-white dark:border-sepia-700 shadow-sm flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen font-bold font-mono text-xs">
                {challengeProgressPercent}%
              </div>
            </div>

            {/* Desktop Theme Switcher & User Account */}
            <div className="hidden md:flex items-center gap-2.5">
              <button
                onClick={() => setIsBadgesOpen(true)}
                className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60"
                title="View Milestone Badges"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Badges</span>
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-2 rounded-xl bg-readflow-green/10 dark:bg-readflow-green/20 border border-readflow-green/20 text-readflow-green dark:text-readflow-lightgreen text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-readflow-green/20"
                title="Generate Weekly Catalyst Report"
              >
                <Printer className="w-3.5 h-3.5 text-readflow-gold" />
                <span>Report</span>
              </button>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 shadow-sm">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name || 'User'} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(currentUser.name || currentUser.email)[0]}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold truncate max-w-[100px] text-sepia-900 dark:text-cream-100 leading-tight">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                    <Cloud className="w-2.5 h-2.5" /> Cloud DB
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="ml-1 p-1 rounded-full text-sepia-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="p-2.5 rounded-lg bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-700 dark:text-cream-200 hover:bg-cream-150 dark:hover:bg-sepia-750 transition-all cursor-pointer"
                title="Re-open Onboarding Tour"
              >
                <HelpCircle className="w-4 h-4 text-readflow-gold" />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-lg bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-700 dark:text-cream-200 hover:bg-cream-150 dark:hover:bg-sepia-750 transition-all cursor-pointer"
                title="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Navigation Tabs */}
      <div className="bg-white dark:bg-sepia-900 border-b border-cream-200 dark:border-sepia-800 py-1 px-6 shadow-sm z-30 sticky top-[73px]">
        <div className="max-w-7xl mx-auto flex gap-4">
          <button
            id="nav-tab-dashboard"
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              currentView === 'dashboard'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-sepia-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            id="nav-tab-logbook"
            onClick={() => setCurrentView('logbook')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              currentView === 'logbook'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-sepia-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Opportunities Logbook
            <span className="bg-cream-150 dark:bg-sepia-850 text-sepia-600 dark:text-cream-200 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {state.opportunities.length}
            </span>
          </button>
          <button
            id="nav-tab-checklist"
            onClick={() => setCurrentView('checklist')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              currentView === 'checklist'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-sepia-300'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Checklist Grid
            <span className="bg-cream-150 dark:bg-sepia-850 text-sepia-600 dark:text-cream-200 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {(state.checklistHabits || []).length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full space-y-6">
        {currentView === 'privacy' ? (
          <PrivacyPage onBack={() => setCurrentView('dashboard')} darkMode={darkMode} />
        ) : currentView === 'terms' ? (
          <TermsPage onBack={() => setCurrentView('dashboard')} darkMode={darkMode} />
        ) : currentView === 'dashboard' ? (
          <>
            {/* Full-Stack Catalyst: The One More Opportunity Suggestion Tray */}
            <section id="catalyst-section">
              <OneMoreButton
                visions={state.visions}
                recentOpportunities={state.opportunities}
                onLogOpportunity={handleLogOpportunity}
              />
            </section>

            {/* Dashboard Layout Grid */}
            <section id="dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Block 1 (Quick Templates + Quick Logger + Inspiration Widget) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <QuickTemplates
                  onLogOpportunity={(title, category, type, points) =>
                    handleLogOpportunity({ title, category, type, points })
                  }
                />
                <QuickLogger
                  scoreConfig={state.scoreConfig}
                  onLogOpportunity={handleLogOpportunity}
                  todayOpportunities={todayOpportunities}
                  onDeleteOpportunity={handleDeleteOpportunity}
                  visions={state.visions}
                  checklistHabits={state.checklistHabits || []}
                  onAddChecklistHabit={handleAddChecklistHabit}
                  onDeleteChecklistHabit={handleDeleteChecklistHabit}
                />
                <Inspiration />
              </div>

              {/* Block 2 (Heatmap Grid + Visions Roadmap) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Heatmap opportunities={state.opportunities} />
                
                <Visions
                  visions={state.visions}
                  opportunities={state.opportunities}
                  onAddVision={handleAddVision}
                  onDeleteVision={handleDeleteVision}
                  onToggleComplete={handleToggleVisionComplete}
                  onSelectVision={(id) => {
                    setSelectedVisionId(id);
                    setCurrentView('vision-details');
                  }}
                />
              </div>
            </section>

            {/* Dashboard Row 2: Analytics, Review, & Pipelines */}
            <section id="secondary-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Analytics & Weekly Review block */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <Analytics opportunities={state.opportunities} pipelines={state.pipelines} />
                <WeeklyReview 
                  opportunities={state.opportunities} 
                  weeklyTargets={state.weeklyTargets || []}
                  onUpdateWeeklyTarget={handleUpdateWeeklyTarget}
                />
              </div>

              {/* Pipeline stages tracker */}
              <div className="lg:col-span-2" id="pipeline-panel">
                <Pipeline
                  pipelines={state.pipelines}
                  onAddPipeline={handleAddPipeline}
                  onUpdatePipeline={handleUpdatePipeline}
                  onDeletePipeline={handleDeletePipeline}
                  activePipelineId={activePipelineId}
                  onSelectPipeline={setActivePipelineId}
                />
              </div>
            </section>

            {/* Streaks row */}
            <section id="streaks-section">
              <Streaks
                streaks={state.streaks}
                streakStates={state.streakStates}
                onToggleStreakActive={handleToggleStreakActive}
              />
            </section>

            {/* Bottom Drawer Tabs: Saved Records and Settings Config */}
            <section id="drawer-section" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden shadow-sm transition-all duration-300">
              {/* Toggle buttons */}
              <div className="flex border-b border-cream-150 dark:border-sepia-800 bg-cream-50/50 dark:bg-sepia-900/60 p-2 gap-2">
                <button
                  id="drawer-tab-vault"
                  onClick={() => setActiveBottomTab('vault')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeBottomTab === 'vault'
                      ? 'bg-readflow-green dark:bg-readflow-olive text-cream-100 font-extrabold shadow'
                      : 'text-sepia-400 hover:text-sepia-700 dark:text-sepia-300'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  Opportunity History & Backup
                </button>
                <button
                  id="drawer-tab-settings"
                  onClick={() => setActiveBottomTab('settings')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeBottomTab === 'settings'
                      ? 'bg-readflow-green dark:bg-readflow-olive text-cream-100 font-extrabold shadow'
                      : 'text-sepia-400 hover:text-sepia-700 dark:text-sepia-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configure Opportunity Scores
                </button>
                <button
                  id="drawer-tab-nudge"
                  onClick={() => setActiveBottomTab('nudge')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeBottomTab === 'nudge'
                      ? 'bg-readflow-green dark:bg-readflow-olive text-cream-100 font-extrabold shadow'
                      : 'text-sepia-400 hover:text-sepia-700 dark:text-sepia-300'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Momentum Nudges
                  {state.nudgeConfig?.enabled && (
                    <span className="w-2 h-2 rounded-full bg-readflow-green dark:bg-readflow-lightgreen animate-pulse ml-1 shrink-0" />
                  )}
                </button>
              </div>

              {/* Active drawer pane */}
              <div className="p-1">
                {activeBottomTab === 'vault' ? (
                  <Vault
                    opportunities={state.opportunities}
                    onImportVault={handleImportVault}
                    onClearVault={handleClearVault}
                    onDeleteOpportunity={handleDeleteOpportunity}
                    onUpdateOpportunity={handleUpdateOpportunity}
                  />
                ) : activeBottomTab === 'settings' ? (
                  <ScoreSettings
                    scoreConfig={state.scoreConfig}
                    onUpdateScoreConfig={handleUpdateScoreConfig}
                    onResetScores={handleResetScores}
                  />
                ) : (
                  <NudgeSettings
                    nudgeConfig={state.nudgeConfig || { enabled: true, soundEnabled: true, browserNotificationsEnabled: false, schedules: [], history: [] }}
                    onUpdateNudgeConfig={handleUpdateNudgeConfig}
                    onTriggerTestNudge={handleTriggerTestNudge}
                  />
                )}
              </div>
            </section>
          </>
        ) : currentView === 'checklist' ? (
          <ChecklistGrid
            checklistHabits={state.checklistHabits || []}
            opportunities={state.opportunities}
            onAddChecklistHabit={handleAddChecklistHabit}
            onDeleteChecklistHabit={handleDeleteChecklistHabit}
            onLogOpportunity={handleLogOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            visions={state.visions}
          />
        ) : currentView === 'vision-details' ? (
          (() => {
            const selectedVision = state.visions.find((v) => v.id === selectedVisionId);
            if (!selectedVision) {
              return (
                <div className="p-12 text-center text-sepia-400 italic">
                  Vision roadmap not found.{' '}
                  <button onClick={() => setCurrentView('dashboard')} className="underline cursor-pointer">
                    Back to Dashboard
                  </button>
                </div>
              );
            }
            return (
              <VisionDetails
                vision={selectedVision}
                opportunities={state.opportunities}
                scoreConfig={state.scoreConfig}
                onBack={() => setCurrentView('dashboard')}
                onUpdateOpportunity={handleUpdateOpportunity}
                onDeleteOpportunity={handleDeleteOpportunity}
                onLogOpportunity={handleLogOpportunity}
                onToggleComplete={handleToggleVisionComplete}
              />
            );
          })()
        ) : (
          <OpportunitiesLogbook
            opportunities={state.opportunities}
            pipelines={state.pipelines}
            visions={state.visions}
            onUpdateOpportunity={handleUpdateOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onAddPipeline={handleAddPipeline}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onSelectPipeline={setActivePipelineId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 mt-12 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold text-slate-400">
            "Your life changes when the number of opportunities you create exceeds the number you wait for."
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => setCurrentView('privacy')} className="hover:text-readflow-green dark:hover:text-readflow-gold transition-colors cursor-pointer">Privacy Policy</button>
            <span className="opacity-40">•</span>
            <button onClick={() => setCurrentView('terms')} className="hover:text-readflow-green dark:hover:text-readflow-gold transition-colors cursor-pointer">Terms of Service</button>
            <span className="opacity-40">•</span>
            <span className="font-mono text-[10px] text-slate-400">
              © 2026 • 1000 Opportunities Challenge
            </span>
          </div>
        </div>
      </footer>

      {state && (
        <NudgeToast
          isOpen={activeNudge.isOpen}
          message={activeNudge.message}
          scoreConfig={state.scoreConfig}
          soundEnabled={state.nudgeConfig?.soundEnabled ?? true}
          onLogOpportunity={(title, category, type, points) => {
            handleLogOpportunity({
              title,
              category,
              type,
              points,
              isSystemSuggestion: false,
            });
          }}
          onClose={handleCloseNudge}
        />
      )}

      {/* Authentication & User Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Onboarding Welcome Tour Modal */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onLogFirstOpportunity={(title, category, type, points) => {
          handleLogOpportunity({ title, category, type, points });
        }}
      />

      {/* Badges & Achievements Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        opportunities={state.opportunities}
        pipelines={state.pipelines}
        currentStreak={state.streakStates?.opportunity?.currentStreak || 0}
      />

      {/* Weekly Catalyst Report Modal */}
      <WeeklyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        opportunities={state.opportunities}
        pipelines={state.pipelines}
        visions={state.visions}
        userName={currentUser?.name || currentUser?.email}
      />
    </div>
  );
}

// Simple helper to load loading status spinner
const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
