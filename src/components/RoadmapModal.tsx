import React, { useState, useEffect, useRef } from 'react';
import { Opportunity } from '../types';
import {
  Trophy,
  X,
  Sparkles,
  Award,
  Zap,
  Target,
  Flag,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Compass,
  Star
} from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: Opportunity[];
  onOpenQuickLogger?: () => void;
}

interface Milestone {
  id: string;
  level: number;
  threshold: number;
  title: string;
  badge: string;
  description: string;
  perk: string;
  color: string;
  darkColor: string;
  glowColor: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'm-10',
    level: 1,
    threshold: 10,
    title: 'The Spark',
    badge: 'Bronze Novice',
    description: 'You stepped onto the field. You proved you can create opportunities instead of waiting for them.',
    perk: 'Unlocked: The Proactive Starter Mindset',
    color: 'from-amber-600 to-amber-700',
    darkColor: 'from-amber-700 to-amber-900',
    glowColor: 'rgba(217, 119, 6, 0.4)',
  },
  {
    id: 'm-50',
    level: 2,
    threshold: 50,
    title: 'Momentum Builder',
    badge: 'Silver Scout',
    description: 'The habit is cementing. You are actively scanning for open doors across career, business, and life.',
    perk: 'Unlocked: Daily Scouting Reflex',
    color: 'from-slate-500 to-slate-700',
    darkColor: 'from-slate-600 to-slate-800',
    glowColor: 'rgba(100, 116, 139, 0.4)',
  },
  {
    id: 'm-100',
    level: 3,
    threshold: 100,
    title: 'The Century Mark',
    badge: 'Gold Pioneer',
    description: '100 opportunities created. You have out-paced 95% of professionals who apply to under 20 roles a year.',
    perk: 'Unlocked: 100 Club Badge & Pipeline Intuition',
    color: 'from-yellow-500 to-amber-600',
    darkColor: 'from-yellow-600 to-amber-800',
    glowColor: 'rgba(234, 179, 8, 0.45)',
  },
  {
    id: 'm-250',
    level: 4,
    threshold: 250,
    title: 'Opportunity Architect',
    badge: 'Emerald Master',
    description: 'Quarter-way to 1,000. Rejection no longer stings; each logged action is simply data and velocity.',
    perk: 'Unlocked: Fearless Outreach Instinct',
    color: 'from-emerald-600 to-teal-700',
    darkColor: 'from-emerald-700 to-teal-900',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'm-500',
    level: 5,
    threshold: 500,
    title: 'The Summit Halfway',
    badge: 'Sapphire Titan',
    description: '500 opportunities generated! Your network and career gravity are now compounding exponentially.',
    perk: 'Unlocked: Inbound Magnetism & Lifetime Momentum',
    color: 'from-blue-600 to-indigo-700',
    darkColor: 'from-blue-700 to-indigo-900',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 'm-750',
    level: 6,
    threshold: 750,
    title: 'Century Club Elite',
    badge: 'Ruby Grandmaster',
    description: 'Three-quarters to the mountaintop. You are an unstoppable force of opportunity creation.',
    perk: 'Unlocked: Elite Opportunity Velocity',
    color: 'from-rose-600 to-pink-700',
    darkColor: 'from-rose-700 to-pink-900',
    glowColor: 'rgba(225, 29, 72, 0.4)',
  },
  {
    id: 'm-1000',
    level: 7,
    threshold: 1000,
    title: 'The 1,000 Pinnacle',
    badge: 'Diamond Legend',
    description: 'You completed the 1,000 Opportunities Challenge. Your life is fundamentally transformed forever.',
    perk: 'Unlocked: Transformed Reality & Ultimate Mastery',
    color: 'from-violet-600 to-purple-800',
    darkColor: 'from-violet-700 to-purple-950',
    glowColor: 'rgba(139, 92, 246, 0.5)',
  },
];

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  onOpenQuickLogger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(MILESTONES[0]);

  const totalLogged = opportunities.length;
  const progressPct = Math.min(100, Math.round((totalLogged / 1000) * 100));

  // Find current active milestone
  const currentLevel = MILESTONES.slice().reverse().find((m) => totalLogged >= m.threshold) || {
    level: 0,
    title: 'Journey Begun',
    badge: 'Aspirant',
    threshold: 0,
  };

  const nextMilestone = MILESTONES.find((m) => m.threshold > totalLogged) || MILESTONES[MILESTONES.length - 1];
  const itemsToNext = Math.max(0, nextMilestone.threshold - totalLogged);

  // Weekly sprint calculation (opportunities logged in past 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekOpps = opportunities.filter((o) => new Date(o.timestamp).getTime() >= oneWeekAgo);
  const weekCount = weekOpps.length;
  const sprintTarget = 7;
  const sprintPct = Math.min(100, Math.round((weekCount / sprintTarget) * 100));

  // Confetti trigger
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      r: number;
      dx: number;
      dy: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#2e5c3e', '#8fb339', '#e8c547', '#3b82f6', '#ec4899', '#f97316'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 3 + (Math.random() - 0.5) * 100,
        r: Math.random() * 5 + 3,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 0.7) * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
      });
    }

    let animationFrame: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.2; // gravity
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fill();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  };

  useEffect(() => {
    if (isOpen) {
      // Find the milestone closest to current progress and select it
      const closest = MILESTONES.find((m) => m.threshold > totalLogged) || MILESTONES[MILESTONES.length - 1];
      setSelectedMilestone(closest);
      fireConfetti();
    }
  }, [isOpen, totalLogged]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans"
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40 w-full h-full"
      />

      <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative z-50">
        {/* Header Hero Banner */}
        <div className="px-6 py-6 border-b border-cream-200 dark:border-sepia-800 bg-gradient-to-r from-readflow-green/10 via-cream-100/50 to-readflow-gold/10 dark:from-sepia-850 dark:via-sepia-900 dark:to-sepia-850 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-readflow-green to-readflow-olive text-cream-50 flex items-center justify-center shadow-lg shadow-readflow-green/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-sepia-850 dark:text-cream-50 tracking-tight">
                  The Road to 1,000 Opportunities
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-readflow-green text-cream-50 font-bold">
                  {currentLevel.badge}
                </span>
              </div>
              <p className="text-xs text-sepia-450 dark:text-sepia-400 mt-0.5">
                "Your life changes when the opportunities you create exceed the ones you wait for."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fireConfetti}
              className="p-2 rounded-xl text-readflow-gold hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
              title="Celebrate progress"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-sepia-400 hover:text-sepia-800 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Progress Bar & Metrics */}
          <div className="p-5 rounded-2xl bg-cream-50/70 dark:bg-sepia-850/60 border border-cream-200/90 dark:border-sepia-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-sepia-500 tracking-wider">
                  Total Challenge Trajectory
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-readflow-green dark:text-readflow-lightgreen">
                    {totalLogged}
                  </span>
                  <span className="text-sm font-mono font-bold text-sepia-400">/ 1,000 Opportunities</span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-mono uppercase font-bold text-sepia-500 tracking-wider">
                  Next Milestone Target
                </span>
                <p className="text-xs font-bold text-sepia-800 dark:text-cream-100 mt-0.5">
                  {itemsToNext === 0 ? '🏆 1,000 Challenge Conquered!' : `${itemsToNext} more to reach ${nextMilestone.title} (${nextMilestone.threshold})`}
                </p>
              </div>
            </div>

            {/* Glowing Main Progress Track */}
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-cream-200/80 dark:bg-sepia-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-readflow-green via-readflow-lightgreen to-readflow-gold transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.max(2, progressPct)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-sepia-450 font-bold">
                <span>0 Sourced</span>
                <span>{progressPct}% Completed</span>
                <span>1,000 Master Pinnacle</span>
              </div>
            </div>
          </div>

          {/* Active Weekly Sprint Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-sepia-850 dark:text-cream-100 uppercase font-mono tracking-wider">
                    Weekly Momentum Sprint
                  </h4>
                  {weekCount >= sprintTarget && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
                      Sprint Target Met!
                    </span>
                  )}
                </div>
                <p className="text-xs text-sepia-650 dark:text-cream-250 mt-0.5">
                  Target: Log <strong>{sprintTarget} opportunities</strong> in 7 rolling days. Current pacing:{' '}
                  <strong>{weekCount} logged</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:shrink-0">
              <div className="w-32 bg-cream-200 dark:bg-sepia-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${sprintPct}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                {weekCount}/{sprintTarget}
              </span>
            </div>
          </div>

          {/* Interactive Milestone Stations Path */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-sepia-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-readflow-green" />
                The 7 Milestone Stations
              </h3>
              <span className="text-[10px] text-sepia-450">Click station to preview perks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MILESTONES.map((m) => {
                const isUnlocked = totalLogged >= m.threshold;
                const isNext = nextMilestone.id === m.id && !isUnlocked;
                const isSelected = selectedMilestone.id === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMilestone(m);
                      if (isUnlocked) fireConfetti();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-readflow-green ring-2 ring-readflow-green/20 bg-cream-50/90 dark:bg-sepia-850'
                        : isUnlocked
                        ? 'border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 hover:border-readflow-green/50'
                        : isNext
                        ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20'
                        : 'border-cream-200/60 dark:border-sepia-800/60 bg-cream-50/20 dark:bg-sepia-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Milestone Badge Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-xs text-white shadow-sm bg-gradient-to-br ${m.color}`}
                        >
                          {isUnlocked ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isNext ? (
                            <Flame className="w-5 h-5 text-amber-200 animate-pulse" />
                          ) : (
                            <Lock className="w-4 h-4 text-white/70" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-sepia-850 dark:text-cream-100">
                              Level {m.level}: {m.title}
                            </h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cream-100 dark:bg-sepia-800 text-sepia-650 dark:text-cream-300">
                              {m.threshold} Opps
                            </span>
                          </div>
                          <p className="text-[11px] text-sepia-450 dark:text-sepia-400 font-medium">
                            {m.badge}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isUnlocked ? (
                          <span className="text-[10px] font-bold font-mono text-readflow-green dark:text-readflow-lightgreen bg-readflow-green/10 dark:bg-readflow-green/20 px-2 py-0.5 rounded-full">
                            UNLOCKED
                          </span>
                        ) : isNext ? (
                          <span className="text-[10px] font-bold font-mono text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                            IN PROGRESS
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold font-mono text-sepia-400 bg-cream-100 dark:bg-sepia-800 px-2 py-0.5 rounded-full">
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-sepia-650 dark:text-cream-200 line-clamp-2">
                      {m.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-cream-150 dark:border-sepia-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-readflow-green dark:text-readflow-lightgreen font-bold truncate">
                        ★ {m.perk}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-sepia-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Action */}
        <div className="px-6 py-4 border-t border-cream-200 dark:border-sepia-800 flex items-center justify-between bg-cream-50/70 dark:bg-sepia-850">
          <div className="text-xs text-sepia-600 dark:text-cream-300 font-sans">
            Selected: <strong>{selectedMilestone.title}</strong> — {selectedMilestone.perk}
          </div>

          <div className="flex items-center gap-2">
            {onOpenQuickLogger && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuickLogger();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive transition-colors cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                Log Opportunity Now
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-sepia-650 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
