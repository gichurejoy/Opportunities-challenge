/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PrivacyPage } from './PrivacyPage';
import { TermsPage } from './TermsPage';
import { 
  ArrowRight, 
  ExternalLink, 
  BookOpen, 
  Link as LinkIcon, 
  Clock, 
  Check, 
  CheckCircle2, 
  Moon, 
  Sun,
  X,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Flame,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  totalOppsCount?: number;
  scoreConfig?: any;
  onLogOpportunity?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  darkMode,
  setDarkMode,
  totalOppsCount = 0,
  scoreConfig = {},
  onLogOpportunity,
}) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'privacy' | 'terms'>('main');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  
  // Interactive Demo States
  const [testTitle, setTestTitle] = useState('');
  const [testCategory, setTestCategory] = useState('Career');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addedPoints, setAddedPoints] = useState(5);

  if (activeSubView === 'privacy') {
    return <PrivacyPage onBack={() => setActiveSubView('main')} darkMode={darkMode} />;
  }
  if (activeSubView === 'terms') {
    return <TermsPage onBack={() => setActiveSubView('main')} darkMode={darkMode} />;
  }

  const categories = scoreConfig && Object.keys(scoreConfig).length > 0
    ? Object.keys(scoreConfig)
    : ['Career', 'Side Projects', 'Learning', 'Health', 'Finance'];

  const opportunityCategories = [
    {
      id: 0,
      category: "Career",
      theme: "Pitch Yourself",
      src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform -rotate-6 translate-y-4",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Send high-leverage cold outreach, submit career applications, or pitch a warm lead directly."
    },
    {
      id: 1,
      category: "Side Projects",
      theme: "Ship Out Publicly",
      src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform rotate-3 translate-y-8",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Deploy a micro-product, publish open source repositories, or launch a targeted landing page."
    },
    {
      id: 2,
      category: "Learning",
      theme: "Acquire Leverage",
      src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform -rotate-2 -translate-y-2",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Study cutting-edge research, complete advanced technical courses, or distill complex mental frameworks."
    },
    {
      id: 3,
      category: "Health",
      theme: "Optimize Stamina",
      src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform rotate-6 translate-y-3",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Power your performance with consistent fitness metrics, focus sleep, and active physical recovery."
    },
    {
      id: 4,
      category: "Finance",
      theme: "Scale Capital",
      src: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform -rotate-3 translate-y-6",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Streamline investment flows, apply for research grants, pitch sponsors, or open secondary revenue."
    },
    {
      id: 5,
      category: "Connections",
      theme: "Multiply Network",
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
      initialStyle: "transform rotate-2 -translate-y-1",
      activeStyle: "blur-[0px] grayscale-[0%] opacity-100 scale-[1.15] -translate-y-[10px] rotate-0 z-50 shadow-2xl",
      inactiveStyle: "blur-[4px] grayscale-[40%] opacity-50 scale-[0.95] z-10",
      desc: "Invite high-leverage builders to advisory talks, align strategic joint ventures, or request mentorship."
    }
  ];

  const handleCategoryClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCategoryIndex === id) {
      setActiveCategoryIndex(null);
    } else {
      setActiveCategoryIndex(id);
    }
  };

  const handleResetCategories = () => {
    setActiveCategoryIndex(null);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    // Fetch the point weight based on score presets in scoreConfig
    const categoryPresets = scoreConfig[testCategory] || {};
    const points = Object.values(categoryPresets)[0] as number || 5;

    if (onLogOpportunity) {
      onLogOpportunity({
        title: testTitle.trim(),
        category: testCategory,
        type: 'Direct Input',
        points: points,
      });
    }

    setAddedPoints(points);
    setIsSubmitted(true);
  };

  const handleResetDemo = () => {
    setTestTitle('');
    setIsSubmitted(false);
  };

  return (
    <div 
      className="min-h-screen bg-stone-50 dark:bg-sepia-950 text-stone-800 dark:text-cream-100 antialiased overflow-x-hidden relative selection:bg-readflow-green/20 selection:text-readflow-green transition-colors duration-300"
      onClick={handleResetCategories}
    >
      {/* Global Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 bg-noise"></div>
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.4] pointer-events-none z-0" 
        style={{
          backgroundImage: `linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-6 pb-20 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] right-[20%] w-[60%] h-[60%] bg-readflow-green/10 dark:bg-readflow-olive/10 blur-[120px] rounded-full mix-blend-multiply"></div>
          <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-readflow-gold/15 dark:bg-readflow-gold/10 blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 relative z-10">
          {/* Navbar */}
          <nav className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={onEnterApp}>
              <div className="flex bg-gradient-to-br from-readflow-green to-readflow-olive w-8 h-8 rounded-full items-center justify-center shadow-md">
                <div className="w-2.5 h-2.5 bg-readflow-gold rounded-full"></div>
              </div>
              <div>
                <span className="text-xl font-serif font-semibold tracking-tight text-stone-900 dark:text-cream-50 block leading-none">
                  1000 Opportunities
                </span>
                <span className="text-[9px] font-mono font-bold text-readflow-gold uppercase tracking-widest block mt-0.5">
                  PROGRESS TRACKER
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-xs font-medium tracking-widest uppercase hover:text-readflow-green dark:hover:text-readflow-gold transition-colors text-stone-500 dark:text-cream-300">Features</a>
              <a href="#how-it-works" className="text-xs font-medium tracking-widest uppercase hover:text-readflow-green dark:hover:text-readflow-gold transition-colors text-stone-500 dark:text-cream-300">Methodology</a>
              <a href="#faq" className="text-xs font-medium tracking-widest uppercase hover:text-readflow-green dark:hover:text-readflow-gold transition-colors text-stone-500 dark:text-cream-300">FAQ</a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }} 
                className="p-2 rounded-full text-stone-500 dark:text-cream-300 hover:text-stone-900 dark:hover:text-cream-50 hover:bg-stone-100 dark:hover:bg-sepia-900 transition-all cursor-pointer"
                title="Toggle theme mode"
              >
                {darkMode ? <Sun className="w-4 h-4 text-readflow-gold" /> : <Moon className="w-4 h-4 text-readflow-green" />}
              </button>
              <button 
                onClick={onEnterApp}
                className="text-sm font-medium hover:text-stone-900 dark:hover:text-cream-50 transition-colors text-stone-500 dark:text-cream-300 hidden sm:block cursor-pointer"
              >
                Launch Dashboard
              </button>
              <button 
                onClick={onEnterApp}
                className="group relative px-5 py-2 bg-stone-900 dark:bg-readflow-green text-white rounded-full text-sm font-medium hover:bg-stone-800 dark:hover:bg-readflow-olive transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Enter Tracker ({totalOppsCount})
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          </nav>

          {/* Centered Hero Content */}
          <div className="flex-1 flex flex-col justify-center pt-8 sm:pt-24 pb-12">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-readflow-green/10 dark:bg-readflow-green/20 border border-readflow-green/20 text-[10px] font-mono font-bold uppercase tracking-widest text-readflow-green dark:text-readflow-gold mb-6">
                <Sparkles className="w-3 h-3 text-readflow-gold animate-pulse" />
                Momentum Driven Growth Engine
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-7xl leading-[0.95] tracking-tighter text-stone-900 dark:text-cream-50 font-serif font-medium mb-8">
                Build your 1000<br />Opportunities Goal.
              </h1>
              <p className="mx-auto max-w-xl text-lg sm:text-xl text-stone-500 dark:text-cream-300 font-light leading-relaxed">
                Transform passive wishing into proactive action. Track high-leverage outbound efforts, gamify compound growth, and launch custom momentum chimes.
              </p>
            </div>

            {/* Gallery Rail */}
            <div className="mt-16 sm:mt-24 max-w-5xl mx-auto relative w-full">
              {/* Floating Tag: Outbound */}
              <div className="-top-8 left-[5%] sm:left-[10%] z-40 absolute animate-[bounce_4s_infinite]">
                <div className="relative group cursor-pointer hover:-translate-y-1 transition-transform">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-cream-200 bg-white dark:bg-sepia-900 border border-stone-200 dark:border-sepia-800 rounded-full py-1.5 px-3 shadow-beautiful hover:shadow-lg transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-readflow-green"></span>
                    Outbound Sprints
                  </span>
                </div>
              </div>

              {/* Floating Tag: Chimes */}
              <div className="-top-12 right-[5%] sm:right-[15%] z-40 absolute animate-[bounce_5s_infinite]">
                <div className="relative group cursor-pointer hover:-translate-y-1 transition-transform">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-cream-200 bg-white dark:bg-sepia-900 border border-stone-200 dark:border-sepia-800 rounded-full py-1.5 px-3 shadow-beautiful hover:shadow-lg transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-readflow-gold"></span>
                    Momentum Alarms
                  </span>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="flex flex-col items-center w-full px-4" id="gallery-container">
                <div className="grid grid-cols-6 gap-3 sm:gap-6 w-full max-w-4xl" id="book-grid">
                  {opportunityCategories.map((item) => {
                    const isSelected = activeCategoryIndex === item.id;
                    const anySelected = activeCategoryIndex !== null;
                    const computedStyle = anySelected
                      ? (isSelected ? item.activeStyle : item.inactiveStyle)
                      : `${item.initialStyle} hover:scale-[1.05]`;

                    return (
                      <div 
                        key={item.id}
                        onClick={(e) => handleCategoryClick(item.id, e)}
                        className={`card-item col-span-2 sm:col-span-1 cursor-pointer group transition-all duration-500 ${computedStyle}`}
                      >
                        <div className="aspect-[2/3] relative rounded-r-md rounded-l-sm bg-white dark:bg-sepia-900 shadow-book overflow-hidden border-l-2 border-stone-100 dark:border-sepia-850 ring-1 ring-black/5 group-hover:ring-readflow-gold/30 transition-shadow">
                          <img 
                            src={item.src} 
                            className="w-full h-full object-cover" 
                            alt={`${item.category} Visual Cover`}
                            referrerPolicy="no-referrer"
                          />
                          {/* Inner Label Accent Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-mono font-bold tracking-widest text-readflow-gold uppercase leading-none block">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-serif font-bold text-white leading-tight block mt-0.5">
                              {item.theme}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Detail Banner */}
                {activeCategoryIndex !== null && (
                  <div className="mt-12 bg-white dark:bg-sepia-900 p-5 rounded-2xl border border-stone-200 dark:border-sepia-800 shadow-xl max-w-lg text-center space-y-2 animate-pulse">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-readflow-green dark:text-readflow-gold uppercase block">
                      Active Exploration
                    </span>
                    <h3 className="text-lg font-serif font-semibold text-stone-900 dark:text-cream-100">
                      {opportunityCategories[activeCategoryIndex].category}: {opportunityCategories[activeCategoryIndex].theme}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-cream-300 max-w-sm leading-relaxed">
                      {opportunityCategories[activeCategoryIndex].desc}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onEnterApp}
                className="group relative px-8 py-3.5 bg-stone-900 dark:bg-readflow-green text-white rounded-full text-base font-medium overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-stone-850 to-stone-950 dark:from-readflow-green dark:to-readflow-olive"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-readflow-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 flex items-center gap-2 font-serif">
                  Start the Challenge
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white dark:bg-sepia-900 text-stone-600 dark:text-cream-200 border border-stone-200 dark:border-sepia-800 text-base font-medium hover:border-readflow-gold hover:text-readflow-green dark:hover:text-readflow-gold hover:bg-stone-50/50 transition-all hover:-translate-y-1 shadow-sm cursor-pointer"
              >
                <span>Launch App</span>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="z-10 relative">
        {/* Problem Section (Sticky Notes) */}
        <section className="relative z-40 py-24 px-6 border-t border-stone-200/60 dark:border-sepia-800/60 bg-white/50 dark:bg-sepia-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {/* Note 1 */}
              <div className="relative bg-white dark:bg-sepia-900 p-8 shadow-beautiful rotate-[-1deg] hover:rotate-0 transition-transform duration-300 min-h-[220px] flex flex-col justify-center border-t-4 border-readflow-green">
                <div className="mb-4 text-readflow-green dark:text-readflow-lightgreen">
                  <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 dark:text-cream-100 mb-2">The Inaction Trap</h3>
                <p className="text-stone-500 dark:text-cream-300 text-sm leading-relaxed">
                  "Most builders wait for perfect timing, invitation, or random luck—relying on a lottery when they should take proactive outbound actions."
                </p>
              </div>

              {/* Note 2 */}
              <div className="relative bg-white dark:bg-sepia-900 p-8 shadow-beautiful rotate-[1.5deg] hover:rotate-0 transition-transform duration-300 min-h-[220px] flex flex-col justify-center border-t-4 border-stone-300 dark:border-sepia-800 md:-mt-6">
                <div className="mb-4 text-readflow-gold">
                  <LinkIcon className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 dark:text-cream-100 mb-2">Inbound Inertia</h3>
                <p className="text-stone-500 dark:text-cream-300 text-sm leading-relaxed">
                  "Pitches are scattered. You lose track of who you reached out to, where the opportunities stand, and how close you are to converting."
                </p>
              </div>

              {/* Note 3 */}
              <div className="relative bg-white dark:bg-sepia-900 p-8 shadow-beautiful rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300 min-h-[220px] flex flex-col justify-center border-t-4 border-readflow-green">
                <div className="mb-4 text-readflow-green dark:text-readflow-lightgreen">
                  <Clock className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 dark:text-cream-100 mb-2">Sporadic Hustling</h3>
                <p className="text-stone-500 dark:text-cream-300 text-sm leading-relaxed">
                  "Without structured daily momentum counters, outbound effort is erratic. You build zero compounding network effects."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white/50 dark:bg-sepia-900/30 relative border-t border-stone-200 dark:border-sepia-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-20">
              <span className="text-readflow-gold font-mono text-xs uppercase tracking-widest mb-2 block font-semibold">Our Framework</span>
              <h2 className="text-3xl md:text-5xl font-serif font-medium text-stone-900 dark:text-cream-50 tracking-tight">Everything you need to build momentum.</h2>
            </div>

            <div className="space-y-24">
              {/* Feature 1: Pipeline */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="flex-1 order-2 md:order-1 relative">
                  {/* Visual: Progress Card */}
                  <div className="relative bg-stone-50 dark:bg-sepia-900 p-6 rounded shadow-beautiful border border-stone-100 dark:border-sepia-800 rotate-[-1deg] max-w-sm mx-auto">
                    <div className="absolute -top-3 left-10 w-16 h-4 bg-readflow-green/20 -rotate-2"></div>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center p-3 bg-white dark:bg-sepia-950 rounded border border-stone-100 dark:border-sepia-800 shadow-sm">
                        <div className="w-10 h-10 bg-readflow-green rounded flex items-center justify-center text-white font-mono text-xs font-bold">+10</div>
                        <div className="flex-1">
                          <div className="h-2.5 w-24 bg-stone-200 dark:bg-sepia-800 rounded mb-2"></div>
                          <div className="w-full h-1.5 bg-stone-100 dark:bg-sepia-900 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-readflow-green"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center p-3 bg-white dark:bg-white/5 rounded border border-stone-100 dark:border-stone-800 shadow-sm opacity-60">
                        <div className="w-10 h-10 bg-readflow-gold rounded flex items-center justify-center text-white font-mono text-xs font-bold">+5</div>
                        <div className="flex-1">
                          <div className="h-2.5 w-16 bg-stone-200 dark:bg-sepia-800 rounded mb-2"></div>
                          <div className="w-full h-1.5 bg-stone-100 dark:bg-sepia-900 rounded-full overflow-hidden">
                            <div className="w-[45%] h-full bg-readflow-gold"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 order-1 md:order-2 text-left">
                  <h3 className="text-2xl font-serif text-stone-900 dark:text-cream-100 mb-4 font-semibold">Visual Conversion Funnels</h3>
                  <p className="text-stone-600 dark:text-cream-300 leading-relaxed mb-6 font-light">
                    Track the exact stage of your outbound actions. Categorize progress from prospecting, outreach, negotiations, to final triumphal conversions.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-cream-300">
                      <CheckCircle2 className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen" />
                      Map your outbound hustle cleanly
                    </li>
                    <li className="flex items-center gap-3 text-sm text-stone-600 dark:text-cream-300">
                      <CheckCircle2 className="w-4 h-4 text-readflow-green dark:text-readflow-lightgreen" />
                      Stay motivated with points and streak weights
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 2: Nudges */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-serif text-stone-900 dark:text-cream-100 mb-4 font-semibold">Configure Daily Momentum Chimes</h3>
                  <p className="text-stone-600 dark:text-cream-300 leading-relaxed mb-6 font-light">
                    Set persistent, non-intrusive sound and banner alarms. Get nudged to log outbound efforts during critical focus periods of your day.
                  </p>
                  <p className="text-sm font-medium text-readflow-green dark:text-readflow-lightgreen">Shift your default stance from reactive response to proactive command.</p>
                </div>
                <div className="flex-1 relative">
                  {/* Visual: Note Card */}
                  <div className="relative bg-white dark:bg-sepia-900 p-6 rounded-sm shadow-beautiful border border-stone-200 dark:border-sepia-800 rotate-[1deg] max-w-sm mx-auto">
                    <div className="absolute -top-3 right-10 w-24 h-6 bg-readflow-gold/25 backdrop-blur-sm -rotate-1"></div>
                    <div className="font-serif text-lg italic text-stone-800 dark:text-cream-200 border-l-2 border-readflow-gold pl-4 mb-4">
                      "Your success is directly proportional to the number of outbound actions you actively create."
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-stone-100 dark:bg-sepia-800 text-[10px] uppercase tracking-wide text-stone-500 dark:text-cream-300 rounded">#Outbound</span>
                      <span className="px-2 py-1 bg-stone-100 dark:bg-sepia-800 text-[10px] uppercase tracking-wide text-stone-500 dark:text-cream-300 rounded">#Momentum</span>
                    </div>
                    <div className="text-xs text-stone-400 dark:text-cream-300 font-mono text-right font-light">Logged: Sent 10 warm outreaches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-stone-100 dark:bg-sepia-900 relative">
          {/* Torn Paper Top Edge */}
          <div className="absolute top-0 left-0 w-full h-8 bg-white dark:bg-sepia-950 z-10" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 2% 50%, 4% 100%, 6% 50%, 8% 100%, 10% 50%, 12% 100%, 14% 50%, 16% 100%, 18% 50%, 20% 100%, 22% 50%, 24% 100%, 26% 50%, 28% 100%, 30% 50%, 32% 100%, 34% 50%, 36% 100%, 38% 50%, 40% 100%, 42% 50%, 44% 100%, 46% 50%, 48% 100%, 50% 50%, 52% 100%, 54% 50%, 56% 100%, 58% 50%, 60% 100%, 62% 50%, 64% 100%, 66% 50%, 68% 100%, 70% 50%, 72% 100%, 74% 50%, 76% 100%, 78% 50%, 80% 100%, 82% 50%, 84% 100%, 86% 50%, 88% 100%, 90% 50%, 92% 100%, 94% 50%, 96% 100%, 98% 50%)', transform: 'rotate(180deg)', marginTop: '-1px' }}></div>
          
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif text-center mb-16 text-stone-900 dark:text-cream-50">The 4-Step Action Loop</h2>
            
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-stone-300 dark:bg-sepia-850 border-l border-dashed border-stone-400"></div>

              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 group">
                  <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                    <h4 className="text-lg font-medium text-stone-900 dark:text-cream-100">Configure score presets</h4>
                    <p className="text-sm text-stone-600 dark:text-cream-300 mt-1">Weight point scales based on categories of proactive outbound exertion.</p>
                  </div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-sepia-900 border-4 border-readflow-green z-10 shadow-sm"></div>
                  <div className="md:w-1/2 md:pl-12 order-3 md:order-2 hidden md:block"></div>
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 group">
                  <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1 hidden md:block"></div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-sepia-900 border-4 border-readflow-gold z-10 shadow-sm"></div>
                  <div className="md:w-1/2 md:pl-12 order-3 md:order-2">
                    <h4 className="text-lg font-medium text-stone-900 dark:text-cream-100">Enable Chime Alarms</h4>
                    <p className="text-sm text-stone-600 dark:text-cream-300 mt-1">Set daily focus reminders to nudge you to take action and log your entries.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 group">
                  <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                    <h4 className="text-lg font-medium text-stone-900 dark:text-cream-100">Log Daily Seeds</h4>
                    <p className="text-sm text-stone-600 dark:text-cream-300 mt-1">Record cold pitches, new code commits, and networking outreaches in seconds.</p>
                  </div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-sepia-900 border-4 border-readflow-green z-10 shadow-sm"></div>
                  <div className="md:w-1/2 md:pl-12 order-3 md:order-2 hidden md:block"></div>
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-6 group">
                  <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1 hidden md:block"></div>
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-sepia-900 border-4 border-readflow-gold z-10 shadow-sm"></div>
                  <div className="md:w-1/2 md:pl-12 order-3 md:order-2">
                    <h4 className="text-lg font-medium text-stone-900 dark:text-cream-100">Track Pipeline Conversion</h4>
                    <p className="text-sm text-stone-600 dark:text-cream-300 mt-1">Review weekly bento dashboard metrics, streak milestones, and balance charts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-12 text-stone-900 dark:text-cream-50">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-sepia-900 p-6 rounded shadow-sm border border-stone-200 dark:border-sepia-800">
              <h4 className="font-medium text-stone-900 dark:text-cream-100 mb-2">Is my Outbound data tracked or shared?</h4>
              <p className="text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
                No. Your logs, targets, contacts, and custom chimes settings are saved strictly on your local browser engine. Everything is 100% private.
              </p>
            </div>
            <div className="bg-white dark:bg-sepia-900 p-6 rounded shadow-sm border border-stone-200 dark:border-sepia-800">
              <h4 className="font-medium text-stone-900 dark:text-cream-100 mb-2">Can I export my logs data?</h4>
              <p className="text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
                Absolutely. From the dashboard settings, you can export your entire database of opportunities as a JSON backup or import it anytime.
              </p>
            </div>
            <div className="bg-white dark:bg-sepia-900 p-6 rounded shadow-sm border border-stone-200 dark:border-sepia-800">
              <h4 className="font-medium text-stone-900 dark:text-cream-100 mb-2">How does the point score engine work?</h4>
              <p className="text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
                Every action you record awards you preset point levels. This gamifies your drive, shifting your daily habits around outward expansion.
              </p>
            </div>
            <div className="bg-white dark:bg-sepia-900 p-6 rounded shadow-sm border border-stone-200 dark:border-sepia-800">
              <h4 className="font-medium text-stone-900 dark:text-cream-100 mb-2">How is this different from a Todo list?</h4>
              <p className="text-sm text-stone-600 dark:text-cream-300 leading-relaxed font-light">
                Todo lists store passive chores you must do. 1000 Opportunities targets proactive outbound leverage actions you actively choose to explore to build your future.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA / Interactive Seed Sandbox */}
        <section className="py-20 text-center relative overflow-hidden bg-stone-900 dark:bg-sepia-900">
          <div className="absolute inset-0 opacity-10 bg-noise z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Plant a Seed Opportunity Today</h2>
            <p className="text-stone-400 mb-8 font-light text-lg">Test the growth framework right now by logging a real outbound seed action.</p>
            
            {isSubmitted ? (
              <div className="p-6 bg-stone-800 border border-stone-700 rounded-xl max-w-md mx-auto text-center space-y-3">
                <Check className="w-10 h-10 text-readflow-gold mx-auto" />
                <h3 className="text-white font-medium text-lg">Opportunity Logged Successfully!</h3>
                <p className="text-stone-400 text-xs">
                  We have added your outbound effort to your live database and credited you with <strong className="text-readflow-gold">+{addedPoints} pts</strong>.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <button 
                    onClick={onEnterApp}
                    className="bg-readflow-green hover:bg-readflow-olive text-white px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Open Dashboard View
                  </button>
                  <button 
                    onClick={handleResetDemo}
                    className="text-xs text-stone-400 hover:text-white px-3 py-2 cursor-pointer"
                  >
                    Log Another Task
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4 max-w-md mx-auto text-left bg-stone-800/45 dark:bg-sepia-950/20 p-6 rounded-2xl border border-stone-750/30">
                <div className="space-y-1.5">
                  <label htmlFor="test-opportunity-title" className="text-[10px] font-mono font-bold text-readflow-gold uppercase tracking-wider block">
                    What outbound task did you complete today?
                  </label>
                  <input 
                    id="test-opportunity-title"
                    type="text" 
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g. Pitched my SaaS product to 5 business owners" 
                    className="px-4 py-3 rounded bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-readflow-green focus:ring-1 focus:ring-readflow-green w-full text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="test-opportunity-cat" className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
                      Category
                    </label>
                    <select
                      id="test-opportunity-cat"
                      value={testCategory}
                      onChange={(e) => setTestCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded bg-stone-800 border border-stone-700 text-white text-xs focus:outline-none focus:border-readflow-green"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full bg-readflow-green hover:bg-readflow-olive text-white px-4 py-2.5 rounded font-medium transition-colors text-xs cursor-pointer h-[38px] flex items-center justify-center gap-1"
                    >
                      Log Sandbox Seed
                      <ChevronRight className="w-3.5 h-3.5 text-readflow-gold" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 dark:bg-sepia-900 text-stone-500 dark:text-cream-300 py-12 text-sm border-t border-stone-200 dark:border-sepia-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 dark:text-cream-50">1000 Opportunities Tracker</span>
            <span className="text-xs">• Outbound Daily Challenge v3.0</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button onClick={onEnterApp} className="hover:text-readflow-green dark:hover:text-readflow-gold transition-colors cursor-pointer text-xs font-semibold">Open App</button>
            <span className="opacity-40">•</span>
            <button onClick={() => setActiveSubView('privacy')} className="hover:text-readflow-green dark:hover:text-readflow-gold transition-colors cursor-pointer text-xs">Privacy Policy</button>
            <span className="opacity-40">•</span>
            <button onClick={() => setActiveSubView('terms')} className="hover:text-readflow-green dark:hover:text-readflow-gold transition-colors cursor-pointer text-xs">Terms of Service</button>
            <span className="opacity-40">•</span>
            <span>No Trackers</span>
            <span className="opacity-40">•</span>
            <span>Local Storage Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
