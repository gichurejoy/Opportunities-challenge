/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Vision, Opportunity, ScoreConfig } from '../types';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  FileCode, 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  FolderOpen, 
  Edit3, 
  Check, 
  Calendar,
  X,
  FileText,
  Bookmark
} from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';

interface VisionDetailsProps {
  vision: Vision;
  opportunities: Opportunity[];
  scoreConfig: ScoreConfig;
  onBack: () => void;
  onUpdateOpportunity: (updatedOpp: Opportunity) => void;
  onDeleteOpportunity: (id: string) => void;
  onLogOpportunity: (opportunity: Omit<Opportunity, 'id' | 'timestamp'> & { timestamp?: string }) => void;
  onToggleComplete: (id: string) => void;
}

export const VisionDetails: React.FC<VisionDetailsProps> = ({
  vision,
  opportunities,
  scoreConfig,
  onBack,
  onUpdateOpportunity,
  onDeleteOpportunity,
  onLogOpportunity,
  onToggleComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Quick Log form state (prepopulated for this vision)
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState(vision.supportingCategories[0] || 'Career');
  const [quickType, setQuickType] = useState('Daily Habit');
  const [quickPoints, setQuickPoints] = useState(5);
  const [quickFeedback, setQuickFeedback] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().substring(0, 10));

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoints, setEditPoints] = useState(1);
  const [editFeedback, setEditFeedback] = useState('');
  const [editDate, setEditDate] = useState('');

  // Find all opportunities linked or supporting this vision
  const supportingOpps = useMemo(() => {
    return opportunities.filter((opp) => {
      // 1. Direct link
      if (opp.linkedVisionId === vision.id) return true;
      
      // 2. Category matching
      const matchesCategory = vision.supportingCategories.includes(opp.category);
      // 3. Type matching
      const matchesType = vision.supportingTypes && vision.supportingTypes.includes(opp.type);
      
      return matchesCategory || matchesType;
    });
  }, [opportunities, vision]);

  // Compute key stats for this specific vision
  const stats = useMemo(() => {
    const totalPoints = supportingOpps.reduce((sum, o) => sum + o.points, 0);
    const count = supportingOpps.length;
    
    // Group by category
    const categoryBreakdown: { [cat: string]: { points: number; count: number } } = {};
    supportingOpps.forEach((opp) => {
      if (!categoryBreakdown[opp.category]) {
        categoryBreakdown[opp.category] = { points: 0, count: 0 };
      }
      categoryBreakdown[opp.category].points += opp.points;
      categoryBreakdown[opp.category].count += 1;
    });

    return {
      totalPoints,
      count,
      categoryBreakdown,
    };
  }, [supportingOpps]);

  // Filtered list of supporting opportunities
  const filteredOpps = useMemo(() => {
    return supportingOpps.filter((opp) => {
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.feedback && opp.feedback.toLowerCase().includes(searchTerm.toLowerCase())) ||
        opp.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || opp.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [supportingOpps, searchTerm, categoryFilter]);

  // Handle inline edits
  const startEditing = (opp: Opportunity) => {
    setEditingId(opp.id);
    setEditTitle(opp.title);
    setEditPoints(opp.points);
    setEditFeedback(opp.feedback || '');
    setEditDate(opp.timestamp.substring(0, 10));
  };

  const saveEdit = (opp: Opportunity) => {
    if (!editTitle.trim()) return;
    
    let nextTimestamp = opp.timestamp;
    if (editDate) {
      const origTime = opp.timestamp.split('T')[1] || '12:00:00.000Z';
      nextTimestamp = `${editDate}T${origTime}`;
    }

    onUpdateOpportunity({
      ...opp,
      title: editTitle.trim(),
      points: Number(editPoints) || 1,
      feedback: editFeedback.trim(),
      timestamp: nextTimestamp,
    });
    setEditingId(null);
  };

  // Pre-seed sub-type choices based on category
  const availableTypes = useMemo(() => {
    const catConfig = scoreConfig[quickCategory] || {};
    return Object.keys(catConfig);
  }, [scoreConfig, quickCategory]);

  // Update default points when category/type changes
  React.useEffect(() => {
    const pts = scoreConfig[quickCategory]?.[quickType] || 5;
    setQuickPoints(pts);
  }, [quickCategory, quickType, scoreConfig]);

  // Set default type when category changes
  React.useEffect(() => {
    const catConfig = scoreConfig[quickCategory] || {};
    const firstType = Object.keys(catConfig)[0] || 'Daily Habit';
    setQuickType(firstType);
  }, [quickCategory, scoreConfig]);

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const originalTime = new Date().toISOString().split('T')[1];
    const finalTimestamp = `${quickDate}T${originalTime}`;

    onLogOpportunity({
      title: quickTitle.trim(),
      category: quickCategory,
      type: quickType,
      points: quickPoints,
      feedback: quickFeedback.trim(),
      linkedVisionId: vision.id,
      timestamp: finalTimestamp,
    });

    setQuickTitle('');
    setQuickFeedback('');
  };

  const percentage = Math.min(100, Math.round((vision.completedPoints / vision.targetPoints) * 100));

  return (
    <div id="vision-detailed-view" className="space-y-6 animate-none font-sans">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            id="vision-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl bg-cream-50 hover:bg-cream-100 dark:bg-sepia-850 dark:hover:bg-sepia-800 text-sepia-800 dark:text-cream-200 transition-all cursor-pointer border border-cream-150 dark:border-sepia-800"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-readflow-green dark:text-readflow-lightgreen tracking-widest flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Vision Ambition Detailed Roadmap
            </span>
            <h1 className="text-2xl font-serif font-bold text-sepia-900 dark:text-cream-100 mt-1">
              {vision.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="vision-toggle-complete-btn"
            onClick={() => onToggleComplete(vision.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm border ${
              vision.isCompleted
                ? 'bg-readflow-green text-cream-50 border-readflow-green hover:bg-readflow-green/95'
                : 'bg-white dark:bg-sepia-850 border-cream-250 dark:border-sepia-800 text-sepia-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-sepia-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {vision.isCompleted ? 'Achieved!' : 'Mark Completed'}
          </button>
        </div>
      </div>

      {/* Hero Stats & Vision Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Progress Summary */}
        <div className="lg:col-span-1 bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-sepia-400 uppercase tracking-wider mb-3">Overall Progress</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-mono font-bold text-sepia-900 dark:text-cream-50">
                {vision.completedPoints}
              </span>
              <span className="text-sm font-sans text-sepia-400">
                / {vision.targetPoints} pts
              </span>
            </div>
            
            {/* Visual Progress ring/bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-sepia-600 dark:text-cream-200">
                <span>Completed</span>
                <span className="font-mono">{percentage}%</span>
              </div>
              <div className="w-full h-3 bg-cream-100 dark:bg-sepia-800 rounded-full overflow-hidden">
                <div
                  className="bg-readflow-green dark:bg-readflow-lightgreen h-full rounded-full transition-all duration-750"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-cream-150 dark:border-sepia-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-sepia-450 dark:text-sepia-500 font-medium">Status:</span>
              <span className={`font-bold ${vision.isCompleted ? 'text-readflow-green' : 'text-readflow-gold'}`}>
                {vision.isCompleted ? 'Completed Vision' : 'Active Ambition'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sepia-450 dark:text-sepia-500 font-medium">Supporting Categories:</span>
              <span className="font-bold text-sepia-800 dark:text-cream-100 text-right max-w-[150px] truncate" title={vision.supportingCategories.join(', ')}>
                {vision.supportingCategories.join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-sepia-450 dark:text-sepia-500 font-medium">Total logged efforts:</span>
              <span className="font-mono font-bold text-sepia-800 dark:text-cream-100">
                {stats.count} logs
              </span>
            </div>
          </div>
        </div>

        {/* Middle Card: Description and Alignment */}
        <div className="lg:col-span-1 bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-sepia-400 uppercase tracking-wider mb-3">Vision Statement & Purpose</h3>
            {vision.description ? (
              <p className="text-sm text-sepia-700 dark:text-cream-150 leading-relaxed font-sans font-medium italic">
                "{vision.description}"
              </p>
            ) : (
              <p className="text-xs text-sepia-400 italic font-sans">
                No description configured. Update this vision statement to add context about what this achievement means to you.
              </p>
            )}
          </div>

          <div className="mt-6 p-4 bg-cream-50/50 dark:bg-sepia-850/20 border border-cream-150 dark:border-sepia-800 rounded-xl space-y-2">
            <h4 className="text-[10px] font-mono font-bold text-sepia-450 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-readflow-gold" />
              Dynamic Alignment Info
            </h4>
            <p className="text-[10.5px] text-sepia-500 dark:text-sepia-400 font-sans leading-normal">
              Any Opportunity scored in <strong>{vision.supportingCategories.join(' or ')}</strong> automatically increments this progress bar. Additionally, any custom opportunities logged with direct alignment will count toward this goal!
            </p>
          </div>
        </div>

        {/* Right Card: Category Breakdown */}
        <div className="lg:col-span-1 bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-sepia-400 uppercase tracking-wider mb-3">Efforts Category Map</h3>
            <div className="space-y-3">
              {vision.supportingCategories.map((cat) => {
                const catMeta = CATEGORY_METADATA[cat] || CATEGORY_METADATA.Career;
                const catStats = stats.categoryBreakdown[cat] || { points: 0, count: 0 };
                const catPercentage = stats.totalPoints > 0 ? Math.round((catStats.points / stats.totalPoints) * 100) : 0;
                
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catMeta.color }} />
                        <span className="font-bold text-sepia-700 dark:text-cream-200">{cat}</span>
                      </div>
                      <span className="font-mono text-sepia-550 dark:text-sepia-400 font-bold">
                        +{catStats.points} pts ({catStats.count} logs)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-cream-100 dark:bg-sepia-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${catPercentage}%`, backgroundColor: catMeta.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {Object.keys(stats.categoryBreakdown).filter(cat => !vision.supportingCategories.includes(cat)).map((cat) => {
                const catMeta = CATEGORY_METADATA[cat] || CATEGORY_METADATA.Career;
                const catStats = stats.categoryBreakdown[cat];
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full border border-sepia-300" style={{ backgroundColor: catMeta.color }} />
                        <span className="font-medium text-sepia-500 dark:text-sepia-400">{cat} <span className="text-[9px] font-bold text-readflow-green">(Direct Link)</span></span>
                      </div>
                      <span className="font-mono text-sepia-550 dark:text-sepia-400">
                        +{catStats.points} pts ({catStats.count} logs)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-[10px] font-mono text-sepia-400 uppercase tracking-widest block mt-4">
              {stats.totalPoints} Total Supporting Points
            </span>
          </div>
        </div>

      </div>

      {/* Inline quick logger for fast progress logging */}
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm">
        <h3 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2 mb-1">
          <Plus className="w-5 h-5 text-readflow-green dark:text-readflow-lightgreen" />
          Log Direct supporting effort
        </h3>
        <p className="text-xs text-sepia-500 dark:text-sepia-400 mb-4 font-sans">
          Log an opportunity or checklist progress item that will immediately link to this Vision. Prepopulated with supportive categories for ultimate convenience!
        </p>

        <form onSubmit={handleQuickLogSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
              Action / Opportunity Title
            </label>
            <input
              type="text"
              required
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="e.g. Completed job application mock, finished agriculture plan, etc."
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
              Category
            </label>
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              {vision.supportingCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              {/* Fallback to other categories if requested */}
              {Object.keys(CATEGORY_METADATA).filter(cat => !vision.supportingCategories.includes(cat)).map((cat) => (
                <option key={cat} value={cat}>{cat} (Indirect)</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
              Action Type
            </label>
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              {!availableTypes.includes('Daily Habit') && <option value="Daily Habit">Daily Habit</option>}
              {!availableTypes.includes('Milestone') && <option value="Milestone">Milestone</option>}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
              Custom Score Points
            </label>
            <select
              value={quickPoints}
              onChange={(e) => setQuickPoints(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-mono font-bold"
            >
              <option value={1}>+1 pt</option>
              <option value={2}>+2 pts</option>
              <option value={3}>+3 pts</option>
              <option value={5}>+5 pts</option>
              <option value={10}>+10 pts</option>
              <option value={15}>+15 pts</option>
              <option value={25}>+25 pts</option>
              <option value={50}>+50 pts</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
              Effort Date
            </label>
            <input
              type="date"
              value={quickDate}
              onChange={(e) => setQuickDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none"
            />
          </div>

          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-10">
              <input
                type="text"
                placeholder="Qualitative feedback notes (e.g. 'Passed the technical interview!' or 'Spoke to a seed distributor')"
                value={quickFeedback}
                onChange={(e) => setQuickFeedback(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-readflow-green dark:bg-readflow-olive hover:bg-readflow-green/95 dark:hover:bg-readflow-olive/95 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Log Progress
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* "Everything Done" List of logs */}
      <div className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-readflow-green" />
              Everything Done Timeline
            </h2>
            <p className="text-xs text-sepia-500 dark:text-sepia-400 mt-1">
              Refined inspection of all completed actions, notes, files, and milestone logs supporting this vision.
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-sepia-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-48 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {vision.supportingCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {Object.keys(stats.categoryBreakdown).filter(c => !vision.supportingCategories.includes(c)).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredOpps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-cream-150 dark:border-sepia-800 rounded-2xl bg-cream-50/10 dark:bg-sepia-950/10">
            <Calendar className="w-10 h-10 text-sepia-300 dark:text-sepia-650 mx-auto mb-2" />
            <p className="text-sm font-bold text-sepia-700 dark:text-cream-200">No logs found</p>
            <p className="text-xs text-sepia-450 dark:text-sepia-500 mt-1">
              {searchTerm || categoryFilter !== 'All' 
                ? 'Try clearing your search query or filters to see all completed logs.'
                : 'No actions have been logged yet. Use the logger above to register progress!'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-cream-150 dark:border-sepia-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-cream-150 dark:border-sepia-800 bg-cream-50/55 dark:bg-sepia-900/40 text-[10px] uppercase font-mono font-bold text-sepia-450 dark:text-sepia-500">
                  <th className="p-3 w-40">Date</th>
                  <th className="p-3">Logged Effort / Action</th>
                  <th className="p-3 w-32">Category</th>
                  <th className="p-3 w-28">Type</th>
                  <th className="p-3 w-24 text-center">Score</th>
                  <th className="p-3 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-150 dark:divide-sepia-800 font-sans">
                {filteredOpps.map((opp) => {
                  const isEditing = editingId === opp.id;
                  const meta = CATEGORY_METADATA[opp.category] || CATEGORY_METADATA.Career;
                  const Icon = meta.icon;

                  return (
                    <tr key={opp.id} className="hover:bg-cream-50/10 dark:hover:bg-sepia-850/5 group">
                      {/* Date column */}
                      <td className="p-3 text-sepia-500 dark:text-sepia-400 font-mono font-medium">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded text-xs w-full"
                          />
                        ) : (
                          new Date(opp.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        )}
                      </td>

                      {/* Title & Notes column */}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="px-2.5 py-1 w-full bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded font-bold text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Qualitative notes..."
                              value={editFeedback}
                              onChange={(e) => setEditFeedback(e.target.value)}
                              className="px-2.5 py-1 w-full bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded text-xs text-sepia-500"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-sepia-850 dark:text-cream-100 text-sm">
                              {opp.title}
                            </div>
                            {opp.feedback && (
                              <p className="text-[11px] text-sepia-500 dark:text-sepia-400 mt-1 italic font-medium leading-relaxed bg-cream-50/40 dark:bg-sepia-950/20 px-2.5 py-1 rounded-md border border-cream-100/50 dark:border-sepia-800/20 inline-block max-w-full">
                                {opp.feedback}
                              </p>
                            )}
                            
                            {/* Attached files indicator */}
                            {opp.fileName && (
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-readflow-green dark:text-readflow-lightgreen font-semibold">
                                <FileText className="w-3.5 h-3.5" />
                                <span className="underline truncate max-w-[200px]" title={opp.fileName}>{opp.fileName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category Badge column */}
                      <td className="p-3">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border"
                          style={{ 
                            color: meta.color, 
                            borderColor: `${meta.color}25`, 
                            backgroundColor: `${meta.color}10` 
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {opp.category}
                        </span>
                      </td>

                      {/* Type badge column */}
                      <td className="p-3 text-[11px] text-sepia-550 dark:text-sepia-450 font-mono">
                        {opp.type || 'generic'}
                      </td>

                      {/* Score points column */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(Number(e.target.value))}
                            className="px-2 py-1 bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded text-xs w-16 text-center font-mono font-bold"
                          />
                        ) : (
                          <span className="font-mono font-bold text-sm text-readflow-green dark:text-readflow-lightgreen">
                            +{opp.points} <span className="text-[10px] text-sepia-400 font-sans">pts</span>
                          </span>
                        )}
                      </td>

                      {/* Inline Actions column */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveEdit(opp)}
                              className="p-1.5 text-readflow-green bg-[#f0f4f0] dark:bg-[#1a2b1d] rounded-lg hover:bg-readflow-green hover:text-white transition-all cursor-pointer"
                              title="Save edits"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-sepia-400 bg-cream-50 dark:bg-sepia-850 rounded-lg hover:bg-sepia-200 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(opp)}
                              className="p-1.5 text-sepia-400 hover:text-readflow-green hover:bg-cream-100 dark:hover:bg-sepia-800 rounded-lg transition-all cursor-pointer"
                              title="Edit log"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteOpportunity(opp.id)}
                              className="p-1.5 text-sepia-300 hover:text-red-500 hover:bg-cream-100 dark:hover:bg-sepia-800 rounded-lg transition-all cursor-pointer"
                              title="Delete log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
