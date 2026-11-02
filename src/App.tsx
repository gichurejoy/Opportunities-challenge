/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { localDb, AppState } from './utils/localDb';
import { Opportunity, OpportunityPipeline, ScoreConfig, Vision, ChecklistHabit, NudgeConfig, isChecklistOpportunity, OpportunityActivity } from './types';
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
import { DeadlineTracker } from './components/DeadlineTracker';
import { CommandPalette } from './components/CommandPalette';
import { AIOpportunityModal } from './components/AIOpportunityModal';
import { CSVImportModal } from './components/CSVImportModal';
import { RoadmapModal } from './components/RoadmapModal';
import { useNetworkStatus, pwaManager } from './utils/pwa';
import { User, api, authStorage } from './utils/api';
import { Sparkles, Trophy, Settings, Archive, Star, CheckCircle, Info, Sun, Moon, LayoutDashboard, ClipboardList, ListChecks, BellRing, Home, LogIn, LogOut, User as UserIcon, Cloud, Database, Printer, Award, HelpCircle, Wifi, WifiOff, RefreshCw, Smartphone, Search, FileSpreadsheet, Wand2, MoreHorizontal } from 'lucide-react';


export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isCSVImportOpen, setIsCSVImportOpen] = useState<boolean>(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [selectedAIOpp, setSelectedAIOpp] = useState<Opportunity | null>(null);
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

  // Close tools dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setIsToolsMenuOpen(false);
      }
    };
    if (isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isToolsMenuOpen]);

  // Global Command Palette keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Offline sync handler when connection is restored
  const handleOfflineSync = async () => {
    if (authStorage.getToken() && state) {
      await api.saveStateToDb(state);
    }
  };

  const { isOnline, isSyncing, hasPendingSync, canInstall, promptInstall, triggerSync } = useNetworkStatus(handleOfflineSync);

  // Sync state to localDb and DB (if authenticated) on updates
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      localDb.saveState(next);
      if (authStorage.getToken()) {
        if (!navigator.onLine) {
          pwaManager.markPendingSync(true);
        } else {
          api.saveStateToDb(next).catch((err) => {
            console.error('Cloud state sync error:', err);
            pwaManager.markPendingSync(true);
          });
        }
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

      const initialActivity: OpportunityActivity = {
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        type: 'created',
        title: 'Opportunity Documented',
        details: `Initial attempt logged under ${newOpp.category}${newOpp.companyOrClient ? ` (${newOpp.companyOrClient})` : ''}`,
        newStage: newOpp.stage || 'Sourced',
      };

      const loggedOpp: Opportunity = {
        ...newOpp,
        id,
        timestamp,
        points,
        activityLog: newOpp.activityLog && newOpp.activityLog.length > 0 ? newOpp.activityLog : [initialActivity],
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

  // Batch import multiple opportunities
  const handleBatchImportOpportunities = (newOpps: Opportunity[]) => {
    updateState((prev) => {
      const nextOpps = [...newOpps, ...prev.opportunities];
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

  // 2.5 Update an opportunity with automated activity log tracking
  const handleUpdateOpportunity = (updatedOpp: Opportunity) => {
    updateState((prev) => {
      let nextPipes = prev.pipelines;
      const existingOpp = prev.opportunities.find((o) => o.id === updatedOpp.id);
      let nextActivityLog = updatedOpp.activityLog ? [...updatedOpp.activityLog] : [];

      if (existingOpp) {
        // Track stage change automatically
        if (updatedOpp.stage && existingOpp.stage !== updatedOpp.stage) {
          nextActivityLog.unshift({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            type: 'stage_change',
            title: `Stage progressed to "${updatedOpp.stage}"`,
            previousStage: existingOpp.stage || 'Sourced',
            newStage: updatedOpp.stage,
          });
        }
        // Track pipeline link
        if (!existingOpp.pipelineId && updatedOpp.pipelineId) {
          nextActivityLog.unshift({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            type: 'pipeline_linked',
            title: 'Linked to Pipeline Tracker',
            details: 'Active lifecycle connected',
          });
        }
        // Track document attached
        if (!existingOpp.fileName && updatedOpp.fileName) {
          nextActivityLog.unshift({
            id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
            type: 'file_attached',
            title: 'File Document Attached',
            details: updatedOpp.fileName,
          });
        }
      }

      const oppWithActivity: Opportunity = {
        ...updatedOpp,
        activityLog: nextActivityLog,
      };

      // Two-way sync: if opportunity is linked to a pipeline and its stage changed, sync the pipeline!
      if (oppWithActivity.pipelineId) {
        nextPipes = prev.pipelines.map((pipe) => {
          if (pipe.id === oppWithActivity.pipelineId) {
            const targetStageName = oppWithActivity.stage;
            if (!targetStageName) return pipe;

            const stageIdx = pipe.stages.findIndex(
              (s) => s.name.toLowerCase() === targetStageName.toLowerCase()
            );

            if (stageIdx >= 0) {
              const updatedStages = [...pipe.stages];
              for (let i = 0; i <= stageIdx; i++) {
                if (!updatedStages[i].completedAt) {
                  updatedStages[i] = { ...updatedStages[i], completedAt: new Date().toISOString() };
                }
              }
              const isLastStage = stageIdx === pipe.stages.length - 1;
              return {
                ...pipe,
                stages: updatedStages,
                currentStageIndex: stageIdx,
                status: (isLastStage ? 'won' : 'active') as 'won' | 'active',
                updatedAt: new Date().toISOString(),
              };
            } else if (
              targetStageName.includes('Won') ||
              targetStageName.includes('Awarded') ||
              targetStageName.includes('Paid') ||
              targetStageName.includes('Completed')
            ) {
              return {
                ...pipe,
                status: 'won' as const,
                currentStageIndex: pipe.stages.length - 1,
                updatedAt: new Date().toISOString(),
              };
            } else if (
              targetStageName.includes('Lost') ||
              targetStageName.includes('Not Selected') ||
              targetStageName.includes('Dropped')
            ) {
              return {
                ...pipe,
                status: 'lost' as const,
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return pipe;
        });
      }

      const nextOpps = prev.opportunities.map((o) => (o.id === oppWithActivity.id ? oppWithActivity : o));

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
        pipelines: nextPipes,
      };
    });
  };

  // 3. Add Opportunity Pipeline
  const handleAddPipeline = (newPipe: Omit<OpportunityPipeline, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateState((prev) => {
      const pipe: OpportunityPipeline = {
        ...newPipe,
        id: (newPipe as any).id || `pipe-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        pipelines: [pipe, ...prev.pipelines],
      };
    });
  };

  // 4. Update Opportunity Pipeline with two-way sync to linked Opportunity
  const handleUpdatePipeline = (updatedPipe: OpportunityPipeline) => {
    updateState((prev) => {
      const nextPipes = prev.pipelines.map((p) => (p.id === updatedPipe.id ? updatedPipe : p));

      // Two-way sync: update the linked opportunity's stage and pipeline link
      const nextOpps = prev.opportunities.map((opp) => {
        if (opp.pipelineId === updatedPipe.id || (updatedPipe.linkedOpportunityId && opp.id === updatedPipe.linkedOpportunityId)) {
          let syncedStage = opp.stage;
          if (updatedPipe.status === 'won') {
            syncedStage = updatedPipe.stages[updatedPipe.stages.length - 1]?.name || 'Won 🎉';
          } else if (updatedPipe.status === 'lost') {
            syncedStage = 'Lost';
          } else if (updatedPipe.stages[updatedPipe.currentStageIndex]) {
            syncedStage = updatedPipe.stages[updatedPipe.currentStageIndex].name;
          }

          let actLog = opp.activityLog ? [...opp.activityLog] : [];
          if (syncedStage && opp.stage !== syncedStage) {
            actLog.unshift({
              id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
              type: 'stage_change',
              title: `Stage progressed to "${syncedStage}" via Pipeline`,
              previousStage: opp.stage,
              newStage: syncedStage,
            });
          }

          return {
            ...opp,
            pipelineId: updatedPipe.id,
            stage: syncedStage,
            activityLog: actLog,
          };
        }
        return opp;
      });

      return {
        ...prev,
        pipelines: nextPipes,
        opportunities: nextOpps,
      };
    });
  };

  // 5. Delete Opportunity Pipeline and safely unlink Opportunity
  const handleDeletePipeline = (id: string) => {
    updateState((prev) => ({
      ...prev,
      pipelines: prev.pipelines.filter((p) => p.id !== id),
      opportunities: prev.opportunities.map((o) => (o.pipelineId === id ? { ...o, pipelineId: undefined } : o)),
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

  // Filter today's opportunities logs (using LOCAL date to avoid UTC timezone mismatch)
  const getLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayLocalStr = getLocalDateStr(new Date());
  const todayOpportunities = state.opportunities.filter((opp) => {
    return getLocalDateStr(new Date(opp.timestamp)) === todayLocalStr;
  });

  const totalOppsCount = state.opportunities.length;
  const challengeProgressPercent = Math.min(100, Math.round((totalOppsCount / 1000) * 100));
  // Count only true opportunities (excluding checklist habits) for Logbook badge
  const logbookOpportunitiesCount = state.opportunities.filter((opp) => !isChecklistOpportunity(opp, state.checklistHabits)).length;

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
      <header className="sticky top-0 bg-white/95 dark:bg-sepia-900/95 backdrop-blur-md border-b border-cream-200 dark:border-sepia-800 z-40 shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Brand & Compact Challenge Progress Capsule */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-readflow-green dark:bg-readflow-olive rounded-xl flex items-center justify-center text-cream-100 font-serif font-bold text-lg sm:text-xl shadow-xs">
                O
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-sepia-900 dark:text-cream-100 leading-none">
                    1000 Opportunities
                  </h1>
                </div>
                <span className="hidden sm:block text-[10px] font-mono font-bold text-readflow-olive dark:text-readflow-gold uppercase tracking-wider mt-1 truncate">
                  Your future is created, not awaited
                </span>
              </div>
            </div>

            {/* Compact Challenge Progress Capsule */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-cream-50 dark:bg-sepia-800/80 border border-cream-200 dark:border-sepia-700 hover:border-readflow-green/40 dark:hover:border-readflow-lightgreen/40 transition-all cursor-pointer group shadow-2xs shrink-0"
              title="Click to view Road to 1,000 Milestone Roadmap"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[11px] font-mono font-bold text-sepia-850 dark:text-cream-100">
                    {totalOppsCount}
                    <span className="text-sepia-400 dark:text-sepia-500 font-normal">/1k</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-readflow-green dark:text-readflow-lightgreen bg-readflow-green/10 dark:bg-readflow-green/20 px-1.5 py-0.2 rounded-full">
                    {challengeProgressPercent}%
                  </span>
                </div>
                <div className="w-14 sm:w-20 h-1.5 bg-cream-200 dark:bg-sepia-700 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-readflow-green dark:bg-readflow-lightgreen transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(challengeProgressPercent, 2)}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Action Center & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Assistant button */}
            <button
              id="header-ai-btn"
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-readflow-green/30 bg-readflow-green/10 dark:bg-readflow-lightgreen/15 text-readflow-green dark:text-readflow-lightgreen hover:bg-readflow-green hover:text-cream-50 dark:hover:bg-readflow-green dark:hover:text-cream-50 text-xs font-bold cursor-pointer transition-all shadow-2xs"
              title="AI Opportunity Parser, Resume Matcher & Outreach Generator"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Road to 1,000 Roadmap */}
            <button
              id="header-roadmap-btn"
              onClick={() => setIsRoadmapOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/70 dark:bg-sepia-850 hover:bg-cream-100 dark:hover:bg-sepia-800 text-sepia-700 dark:text-cream-200 text-xs font-bold cursor-pointer transition-all shadow-2xs"
              title="Road to 1,000 Milestone Stations & Sprints"
            >
              <Trophy className="w-3.5 h-3.5 text-readflow-gold" />
              <span>Roadmap</span>
            </button>

            {/* Command Palette Trigger */}
            <button
              id="header-command-palette-btn"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/70 dark:bg-sepia-850 text-sepia-650 dark:text-cream-200 hover:border-readflow-green/60 text-xs font-semibold cursor-pointer transition-all shadow-2xs"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-readflow-green dark:text-readflow-lightgreen" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-750 rounded text-sepia-500 dark:text-cream-300">
                Ctrl K
              </kbd>
            </button>

            {/* Quick Tools Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                id="header-tools-menu-btn"
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                  isToolsMenuOpen
                    ? 'border-readflow-green bg-cream-150 dark:bg-sepia-800 text-readflow-green dark:text-readflow-lightgreen'
                    : 'border-cream-200 dark:border-sepia-800 bg-cream-50/70 dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 hover:bg-cream-100 dark:hover:bg-sepia-800'
                }`}
                title="Quick Tools & Actions"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Tools</span>
              </button>

              {isToolsMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-sepia-400 dark:text-sepia-500 border-b border-cream-150 dark:border-sepia-800">
                    Quick Tools & Utilities
                  </div>
                  
                  <button
                    id="header-import-csv-btn"
                    onClick={() => { setIsCSVImportOpen(true); setIsToolsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-sepia-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Import CSV / Excel</div>
                      <div className="text-[10px] text-sepia-400 dark:text-sepia-500">Batch add opportunities</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsReportOpen(true); setIsToolsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-sepia-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4 text-readflow-gold shrink-0" />
                    <div>
                      <div className="font-bold">Weekly Catalyst Report</div>
                      <div className="text-[10px] text-sepia-400 dark:text-sepia-500">Printable review dossier</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsBadgesOpen(true); setIsToolsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-sepia-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold">Milestone Badges</div>
                      <div className="text-[10px] text-sepia-400 dark:text-sepia-500">View unlocked achievements</div>
                    </div>
                  </button>

                  {canInstall && (
                    <button
                      id="pwa-install-btn"
                      onClick={() => { promptInstall(); setIsToolsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-sepia-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen shrink-0" />
                      <div>
                        <div className="font-bold">Install PWA App</div>
                        <div className="text-[10px] text-sepia-400 dark:text-sepia-500">Install to your device</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsOnboardingOpen(true); setIsToolsMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-sepia-800 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 flex items-center gap-2.5 cursor-pointer transition-colors border-t border-cream-150 dark:border-sepia-800 mt-1"
                  >
                    <HelpCircle className="w-4 h-4 text-readflow-olive dark:text-readflow-gold shrink-0" />
                    <div>
                      <div className="font-bold">Re-open Tour</div>
                      <div className="text-[10px] text-sepia-400 dark:text-sepia-500">Onboarding walkthrough</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* THE PROMINENT THEME TOGGLE (MODE CHANGER) - Always visible, never cut off! */}
            <button
              id="header-theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="px-2.5 py-1.5 rounded-xl bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 text-sepia-800 dark:text-cream-100 hover:bg-cream-150 dark:hover:bg-sepia-750 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme mode"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
              <span className="text-xs font-bold text-sepia-700 dark:text-cream-200 hidden sm:inline">
                {darkMode ? "Light" : "Dark"}
              </span>
            </button>

            {/* User Account Capsule */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 shadow-2xs">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name || 'User'} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold uppercase">
                  {(currentUser.name || currentUser.email)[0]}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold truncate max-w-[85px] lg:max-w-[105px] text-sepia-900 dark:text-cream-100 leading-tight">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
                {!isOnline ? (
                  <span className="text-[8px] text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-0.5 animate-pulse" title="Offline Mode: Changes saved locally">
                    <WifiOff className="w-2 h-2" /> Offline
                  </span>
                ) : isSyncing ? (
                  <span className="text-[8px] text-blue-600 dark:text-blue-400 font-mono font-bold flex items-center gap-0.5" title="Syncing changes to cloud...">
                    <RefreshCw className="w-2 h-2 animate-spin" /> Syncing...
                  </span>
                ) : hasPendingSync ? (
                  <button
                    onClick={triggerSync}
                    className="text-[8px] text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-0.5 underline cursor-pointer hover:text-amber-700"
                    title="Click to sync offline changes now"
                  >
                    <Cloud className="w-2 h-2" /> Sync Cloud
                  </button>
                ) : (
                  <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                    <Cloud className="w-2 h-2" /> Cloud DB
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 rounded-full text-sepia-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
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
                ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-cream-300 dark:hover:text-cream-100'
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
                ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-cream-300 dark:hover:text-cream-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Opportunities Logbook
            <span className="bg-cream-150 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 border border-cream-200 dark:border-sepia-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {logbookOpportunitiesCount}
            </span>
          </button>
          <button
            id="nav-tab-checklist"
            onClick={() => setCurrentView('checklist')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              currentView === 'checklist'
                ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-400 hover:text-sepia-750 dark:text-cream-300 dark:hover:text-cream-100'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Checklist Grid
            <span className="bg-cream-150 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 border border-cream-200 dark:border-sepia-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
              {(state.checklistHabits || []).length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className={`flex-1 w-full py-6 pb-24 sm:pb-6 space-y-6 ${currentView === 'logbook' ? 'px-4 lg:px-8' : 'max-w-7xl mx-auto px-6'}`}>
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

            {/* Approaching Deadlines & Countdown Calendar */}
            <section id="deadlines-section">
              <DeadlineTracker
                opportunities={state.opportunities}
                onNavigateToLogbook={() => setCurrentView('logbook')}
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
                  opportunities={state.opportunities}
                  onAddPipeline={handleAddPipeline}
                  onUpdatePipeline={handleUpdatePipeline}
                  onDeletePipeline={handleDeletePipeline}
                  onUpdateOpportunity={handleUpdateOpportunity}
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
            <section id="drawer-section" className="w-full bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 overflow-hidden shadow-sm transition-all duration-300">
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
              <div className="p-1 w-full">
                {activeBottomTab === 'vault' ? (
                  <Vault
                    opportunities={state.opportunities}
                    checklistHabits={state.checklistHabits || []}
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
            checklistHabits={state.checklistHabits || []}
            onUpdateOpportunity={handleUpdateOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onAddPipeline={handleAddPipeline}
            onUpdatePipeline={handleUpdatePipeline}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onSelectPipeline={setActivePipelineId}
            onOpenCSVImport={() => setIsCSVImportOpen(true)}
            onOpenAIParser={() => setIsAIOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 mt-12 py-6 pb-24 sm:pb-6 text-center text-xs text-slate-400">
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

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        opportunities={state.opportunities}
        pipelines={state.pipelines}
        visions={state.visions}
        onNavigate={(view) => setCurrentView(view)}
        onSelectPipeline={(id) => setActivePipelineId(id)}
        onSelectVision={(id) => {
          setSelectedVisionId(id);
          setCurrentView('vision-details');
        }}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onExportCSV={() => {
          // Trigger export in logbook or direct
          setCurrentView('logbook');
        }}
        onQuickLogCategory={(cat) => {
          setCurrentView('dashboard');
          setTimeout(() => {
            const el = document.getElementById('catalyst-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onOpenAIParser={() => setIsAIOpen(true)}
        onOpenCSVImport={() => setIsCSVImportOpen(true)}
        onOpenRoadmap={() => setIsRoadmapOpen(true)}
        darkMode={darkMode}
      />

      {/* AI Opportunity Parser & Pitch Generator Modal */}
      <AIOpportunityModal
        isOpen={isAIOpen}
        onClose={() => {
          setIsAIOpen(false);
          setSelectedAIOpp(null);
        }}
        onAddOpportunity={handleLogOpportunity}
        onUpdateOpportunity={handleUpdateOpportunity}
        opportunities={state.opportunities}
        initialOpportunity={selectedAIOpp}
      />

      {/* CSV Spreadsheet Bulk Import Modal */}
      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImportOpportunities={handleBatchImportOpportunities}
      />

      {/* Gamified Road to 1,000 Roadmap Modal */}
      <RoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        opportunities={state.opportunities}
        onOpenQuickLogger={() => {
          setCurrentView('dashboard');
          setTimeout(() => {
            const el = document.getElementById('catalyst-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        aria-label="Mobile Bottom Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-sepia-900/95 backdrop-blur-md border-t border-cream-200 dark:border-sepia-800 px-3 py-1.5 flex items-center justify-around shadow-2xl pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <button
          type="button"
          id="mobile-nav-dashboard"
          onClick={() => {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'dashboard'
              ? 'text-readflow-green dark:text-readflow-lightgreen font-bold'
              : 'text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </button>

        <button
          type="button"
          id="mobile-nav-logbook"
          onClick={() => {
            setCurrentView('logbook');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'logbook'
              ? 'text-readflow-green dark:text-readflow-lightgreen font-bold'
              : 'text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Logbook</span>
          {logbookOpportunitiesCount > 0 && (
            <span className="absolute top-0 right-1.5 bg-readflow-green dark:bg-readflow-lightgreen text-cream-50 dark:text-sepia-950 text-[9px] font-mono font-bold px-1 rounded-full min-w-4 text-center leading-tight">
              {logbookOpportunitiesCount}
            </span>
          )}
        </button>

        {/* Center Floating Quick Action Button */}
        <div className="relative -top-3">
          <button
            type="button"
            id="mobile-nav-quick-action"
            onClick={() => {
              if (currentView !== 'dashboard') {
                setCurrentView('dashboard');
              }
              setTimeout(() => {
                const catalystEl = document.getElementById('catalyst-section');
                if (catalystEl) {
                  catalystEl.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-readflow-olive to-readflow-green text-cream-50 flex items-center justify-center shadow-lg shadow-readflow-green/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white dark:border-sepia-900"
            title="Quick Log Opportunity"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          id="mobile-nav-checklist"
          onClick={() => {
            setCurrentView('checklist');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'checklist'
              ? 'text-readflow-green dark:text-readflow-lightgreen font-bold'
              : 'text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200'
          }`}
        >
          <ListChecks className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Checklist</span>
          {(state?.checklistHabits || []).length > 0 && (
            <span className="absolute top-0 right-1.5 bg-readflow-gold text-sepia-950 text-[9px] font-mono font-bold px-1 rounded-full min-w-4 text-center leading-tight">
              {(state?.checklistHabits || []).length}
            </span>
          )}
        </button>

        <button
          type="button"
          id="mobile-nav-vault"
          onClick={() => {
            setCurrentView('dashboard');
            setActiveBottomTab('vault');
            setTimeout(() => {
              const vaultEl = document.getElementById('drawer-section');
              if (vaultEl) {
                vaultEl.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            currentView === 'dashboard' && activeBottomTab === 'vault'
              ? 'text-readflow-green dark:text-readflow-lightgreen font-bold'
              : 'text-sepia-400 hover:text-sepia-700 dark:hover:text-cream-200'
          }`}
        >
          <Archive className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Vault</span>
        </button>
      </nav>
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
