/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Building, 
  BookOpen, 
  Coins, 
  Activity, 
  Heart, 
  Rocket, 
  Sprout, 
  Plus, 
  Trash2, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Opportunity, ScoreConfig, Vision, ChecklistHabit } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface QuickLoggerProps {
  scoreConfig: ScoreConfig;
  onLogOpportunity: (opportunity: Omit<Opportunity, 'id' | 'timestamp'>) => void;
  todayOpportunities: Opportunity[];
  onDeleteOpportunity: (id: string) => void;
  visions: Vision[];
  checklistHabits: ChecklistHabit[];
  onAddChecklistHabit: (habit: Omit<ChecklistHabit, 'id'>) => void;
  onDeleteChecklistHabit: (id: string) => void;
}

export const CATEGORY_METADATA: {
  [key: string]: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    text: string;
  };
} = {
  Career: { icon: Briefcase, color: '#1b3d22', bg: 'bg-[#f0f4f0] dark:bg-[#1a2b1d]', border: 'border-[#dfebd5] dark:border-[#2d4231]', text: 'text-readflow-green dark:text-cream-200' },
  Business: { icon: Building, color: '#c29543', bg: 'bg-[#fcf7ec] dark:bg-[#2b2518]', border: 'border-[#f2e6cb] dark:border-[#423925]', text: 'text-amber-800 dark:text-cream-200' },
  Learning: { icon: BookOpen, color: '#3f5d45', bg: 'bg-[#f4f7f4] dark:bg-[#1c261f]', border: 'border-[#e4ebe4] dark:border-[#2a382d]', text: 'text-readflow-olive dark:text-cream-200' },
  Finance: { icon: Coins, color: '#967433', bg: 'bg-[#f9f5ed] dark:bg-[#262118]', border: 'border-[#eeddbb] dark:border-[#383124]', text: 'text-amber-900 dark:text-cream-200' },
  Health: { icon: Activity, color: '#a64d4d', bg: 'bg-[#fcf2f2] dark:bg-[#2b1c1c]', border: 'border-[#f4dddd] dark:border-[#422a2a]', text: 'text-red-800 dark:text-cream-200' },
  Personal: { icon: Heart, color: '#9e527f', bg: 'bg-[#faf0f5] dark:bg-[#2b1b24]', border: 'border-[#f3dde8] dark:border-[#422837]', text: 'text-pink-800 dark:text-cream-200' },
  'Side Projects': { icon: Rocket, color: '#3d617a', bg: 'bg-[#f0f4f7] dark:bg-[#1b252b]', border: 'border-[#dfebf2] dark:border-[#283842]', text: 'text-slate-800 dark:text-cream-200' },
  Farming: { icon: Sprout, color: '#567d26', bg: 'bg-[#f4f7ef] dark:bg-[#1f2b15]', border: 'border-[#e5edd8] dark:border-[#304221]', text: 'text-lime-900 dark:text-cream-200' },
};

export const QuickLogger: React.FC<QuickLoggerProps> = ({
  scoreConfig,
  onLogOpportunity,
  todayOpportunities,
  onDeleteOpportunity,
  visions,
  checklistHabits,
  onAddChecklistHabit,
  onDeleteChecklistHabit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Career');
  const [simpleTitle, setSimpleTitle] = useState<string>('');
  const [companyOrClient, setCompanyOrClient] = useState<string>('');
  const [expectedValue, setExpectedValue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'simple' | 'preset' | 'custom' | 'checklist'>('simple');
  const [selectedVisionId, setSelectedVisionId] = useState<string>('');

  // States for custom checklist habit
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Career');
  const [newHabitPoints, setNewHabitPoints] = useState(3);

  const handleLogSimple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simpleTitle.trim()) return;

    // Smart auto points: fetch the score config's first template points or fall back to 3 points
    const currentCategoryPresets = scoreConfig[selectedCategory] || {};
    const firstPresetPoints = Object.values(currentCategoryPresets)[0] as number || 3;

    onLogOpportunity({
      title: simpleTitle.trim(),
      category: selectedCategory,
      type: 'Direct Input',
      points: firstPresetPoints,
      companyOrClient: companyOrClient.trim() || undefined,
      expectedValue: expectedValue.trim() || undefined,
      linkedVisionId: selectedVisionId || undefined,
      description: description.trim() || undefined,
    });

    setSimpleTitle('');
    setCompanyOrClient('');
    setExpectedValue('');
    setSelectedVisionId('');
    setDescription('');
  };

  const handleLogPreset = (type: string, points: number) => {
    onLogOpportunity({
      title: type,
      category: selectedCategory,
      type,
      points,
      companyOrClient: companyOrClient.trim() || undefined,
      expectedValue: expectedValue.trim() || undefined,
      linkedVisionId: selectedVisionId || undefined,
      description: description.trim() || undefined,
    });
    setCompanyOrClient('');
    setExpectedValue('');
    setSelectedVisionId('');
    setDescription('');
  };

  const handleLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onLogOpportunity({
      title: customTitle.trim(),
      category: selectedCategory,
      type: 'Custom Initiative',
      points: customPoints || 1,
      companyOrClient: companyOrClient.trim() || undefined,
      expectedValue: expectedValue.trim() || undefined,
      linkedVisionId: selectedVisionId || undefined,
      description: description.trim() || undefined,
    });

    setCustomTitle('');
    setCustomPoints(0);
    setCompanyOrClient('');
    setExpectedValue('');
    setSelectedVisionId('');
    setDescription('');
  };

  const handleToggleChecklistHabit = (habit: ChecklistHabit) => {
    const isCompletedToday = todayOpportunities.some(
      (o) => o.title.toLowerCase() === habit.title.toLowerCase() && o.category === habit.category
    );

    if (isCompletedToday) {
      // Find today's logged opportunity and delete it
      const found = todayOpportunities.find(
        (o) => o.title.toLowerCase() === habit.title.toLowerCase() && o.category === habit.category
      );
      if (found) {
        onDeleteOpportunity(found.id);
      }
    } else {
      onLogOpportunity({
        title: habit.title,
        category: habit.category,
        type: habit.type || 'Daily Habit',
        points: habit.points,
      });
    }
  };

  const handleAddHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    onAddChecklistHabit({
      title: newHabitTitle.trim(),
      category: newHabitCategory,
      type: 'Daily Habit',
      points: newHabitPoints,
    });
    setNewHabitTitle('');
  };

  const currentCategoryPresets = scoreConfig[selectedCategory] || {};
  const currentMeta = CATEGORY_METADATA[selectedCategory] || CATEGORY_METADATA.Career;
  const CategoryIcon = currentMeta.icon;

  return (
    <div id="quick-logger-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-readflow-gold" />
          Log Opportunities
        </h2>
        <span className="text-xs font-mono font-bold text-readflow-green dark:text-readflow-lightgreen bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-700 px-2.5 py-1 rounded-md">
          Today: {todayOpportunities.length} logged
        </span>
      </div>

      {/* Category selector chips */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.keys(CATEGORY_METADATA).map((cat) => {
          const meta = CATEGORY_METADATA[cat];
          const Icon = meta.icon;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedCategory(cat);
                setCustomPoints(0); // Reset custom points when category changes
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? `${meta.bg} ${meta.border} border-2 ring-1 ring-readflow-green/20 dark:ring-offset-sepia-900 scale-[1.02] font-semibold`
                  : 'bg-transparent border-cream-100 dark:border-sepia-800 hover:border-cream-200 dark:hover:border-sepia-750'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1`} style={{ color: meta.color }} />
              <span className="text-[10px] font-sans font-semibold text-sepia-600 dark:text-sepia-300 truncate w-full">
                {cat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mode toggle */}
      <div className="flex border-b border-cream-200 dark:border-sepia-800 mb-4 text-xs font-semibold">
        <button
          id="tab-simple"
          onClick={() => setActiveTab('simple')}
          className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'simple'
              ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-cream-100 font-bold'
              : 'border-transparent text-sepia-400 hover:text-sepia-600 dark:text-sepia-500'
          }`}
        >
          Simple Log
        </button>
        <button
          id="tab-preset"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'preset'
              ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-cream-100 font-bold'
              : 'border-transparent text-sepia-400 hover:text-sepia-600 dark:text-sepia-500'
          }`}
        >
          Presets
        </button>
        <button
          id="tab-custom"
          onClick={() => setActiveTab('custom')}
          className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'custom'
              ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-cream-100 font-bold'
              : 'border-transparent text-sepia-400 hover:text-sepia-600 dark:text-sepia-500'
          }`}
        >
          Custom
        </button>
        <button
          id="tab-checklist"
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 pb-2 text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'checklist'
              ? 'border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-cream-100 font-bold'
              : 'border-transparent text-sepia-400 hover:text-sepia-600 dark:text-sepia-500'
          }`}
        >
          Checklist
        </button>
      </div>

      {/* Active Form Panel */}
      <div className="flex-1 flex flex-col justify-start gap-4">
        {activeTab === 'simple' ? (
          <form id="simple-opportunity-form" onSubmit={handleLogSimple} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5 font-sans">
                What did you do? (We'll auto-assign category weights)
              </label>
              <textarea
                id="simple-title-input"
                required
                rows={2}
                value={simpleTitle}
                onChange={(e) => setSimpleTitle(e.target.value)}
                placeholder={`e.g., Messaged senior recruiter about the ${selectedCategory} opening, or read 10 pages...`}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen resize-none font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Target Company / Client (Optional)
                </label>
                <input
                  id="simple-company-input"
                  type="text"
                  value={companyOrClient}
                  onChange={(e) => setCompanyOrClient(e.target.value)}
                  placeholder="e.g. Acme Corp, Microsoft, Stanford"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Expected Salary / Grant / Amount (Optional)
                </label>
                <input
                  id="simple-expected-value-input"
                  type="text"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="e.g. $120k / yr, $15,000 grant, KSh 50k"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Job Description / Enquiry Details (Optional)
              </label>
              <textarea
                id="simple-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. paste job description, requirements, or enquiry copy..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen resize-y font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Link to Long-Term Vision / Goal (Optional)
              </label>
              <select
                id="simple-vision-select"
                value={selectedVisionId}
                onChange={(e) => setSelectedVisionId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
              >
                <option value="">-- None (Or auto-link by Category) --</option>
                {visions.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>

            <button
              id="submit-simple-btn"
              type="submit"
              className="w-full bg-readflow-green dark:bg-readflow-olive text-cream-50 py-2.5 rounded-xl text-xs font-bold hover:bg-readflow-green/90 dark:hover:bg-readflow-olive/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log in {selectedCategory}
            </button>
          </form>
        ) : activeTab === 'preset' ? (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Link to Long-Term Vision / Goal (Optional)
              </label>
              <select
                id="preset-vision-select"
                value={selectedVisionId}
                onChange={(e) => setSelectedVisionId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium mb-3"
              >
                <option value="">-- None (Or auto-link by Category) --</option>
                {visions.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Target Company / Client (Optional)
                </label>
                <input
                  id="preset-company-input"
                  type="text"
                  value={companyOrClient}
                  onChange={(e) => setCompanyOrClient(e.target.value)}
                  placeholder="e.g. Acme Corp, Microsoft, Stanford"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Expected Salary / Grant / Amount (Optional)
                </label>
                <input
                  id="preset-expected-value-input"
                  type="text"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="e.g. $120k / yr, $15k grant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Job Description / Enquiry Details (Optional)
              </label>
              <textarea
                id="preset-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. paste job description, requirements, or enquiry copy..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen resize-y font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
              />
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {Object.keys(currentCategoryPresets).length === 0 ? (
                <p className="text-xs text-sepia-400 text-center py-4">No presets defined. Use simple mode!</p>
              ) : (
                Object.entries(currentCategoryPresets).map(([type, points]) => (
                  <button
                    key={type}
                    id={`preset-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleLogPreset(type, points as number)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-cream-150 dark:border-sepia-800 hover:bg-cream-50 dark:hover:bg-sepia-800/40 text-left transition-all text-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4" style={{ color: currentMeta.color }} />
                      <span className="font-semibold text-sepia-700 dark:text-sepia-200">{type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sepia-800 dark:text-sepia-100 bg-cream-50 dark:bg-sepia-850 px-2 py-0.5 rounded text-[11px] border border-cream-100 dark:border-sepia-850">
                        +{(points as number)} {(points as number) === 1 ? 'pt' : 'pts'}
                      </span>
                      <span className="p-0.5 rounded bg-cream-100 dark:bg-sepia-800 group-hover:bg-readflow-green dark:group-hover:bg-readflow-lightgreen group-hover:text-cream-50 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : activeTab === 'custom' ? (
          <form id="custom-opportunity-form" onSubmit={handleLogCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1.5">
                Opportunity Title / Initiative
              </label>
              <input
                id="custom-title-input"
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Completed specialized business proposal deck"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Target Company / Client (Optional)
                </label>
                <input
                  id="custom-company-input"
                  type="text"
                  value={companyOrClient}
                  onChange={(e) => setCompanyOrClient(e.target.value)}
                  placeholder="e.g. Acme Corp, Microsoft, Stanford"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                  Expected Salary / Grant / Amount (Optional)
                </label>
                <input
                  id="custom-expected-value-input"
                  type="text"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="e.g. $120k / yr, $15k grant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Job Description / Enquiry Details (Optional)
              </label>
              <textarea
                id="custom-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. paste job description, requirements, or enquiry copy..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen resize-y font-sans placeholder-sepia-300 dark:placeholder-sepia-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1">
                <span>Custom Score Weight</span>
                <span className="text-sepia-900 dark:text-cream-100 font-mono font-bold">
                  {customPoints || 'Auto-assign'} {customPoints ? (customPoints === 1 ? 'point' : 'points') : ''}
                </span>
              </div>
              <input
                id="custom-points-slider"
                type="range"
                min="0"
                max="20"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                className="w-full accent-readflow-green dark:accent-readflow-lightgreen bg-cream-150 dark:bg-sepia-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-sepia-400 mt-1">
                Leave at 0 to auto-assign standard Category micro-weight (typically +1 to +5).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-500 dark:text-sepia-400 mb-1 font-sans">
                Link to Long-Term Vision / Goal (Optional)
              </label>
              <select
                id="custom-vision-select"
                value={selectedVisionId}
                onChange={(e) => setSelectedVisionId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
              >
                <option value="">-- None (Or auto-link by Category) --</option>
                {visions.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>

            <button
              id="submit-custom-btn"
              type="submit"
              className="w-full bg-readflow-green dark:bg-readflow-olive text-cream-50 py-2.5 rounded-xl text-xs font-bold hover:bg-readflow-green/90 dark:hover:bg-readflow-olive/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Log Custom Opportunity
            </button>
          </form>
        ) : (
          /* Daily Checklist Tab */
          <div className="space-y-3 flex flex-col h-full">
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {checklistHabits.map((habit) => {
                const isCompletedToday = todayOpportunities.some(
                  (o) => o.title.toLowerCase() === habit.title.toLowerCase() && o.category === habit.category
                );
                const meta = CATEGORY_METADATA[habit.category] || CATEGORY_METADATA.Career;
                const Icon = meta.icon;
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-cream-150 dark:border-sepia-800 bg-cream-50/20 dark:bg-sepia-850/40 text-xs hover:border-cream-250 transition-all animate-none"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isCompletedToday}
                        onChange={() => handleToggleChecklistHabit(habit)}
                        className="w-4 h-4 rounded text-readflow-green dark:text-readflow-lightgreen border-cream-300 dark:border-sepia-750 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                        <span className={`font-medium truncate font-sans ${isCompletedToday ? 'line-through text-sepia-300 dark:text-sepia-600' : 'text-sepia-750 dark:text-cream-100'}`}>
                          {habit.title}
                        </span>
                      </div>
                    </label>
                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      <span className="font-mono font-bold text-sepia-600 dark:text-sepia-400 text-[10px] bg-cream-50 dark:bg-sepia-850 px-1.5 py-0.5 rounded">
                        +{habit.points} pts
                      </span>
                      <button
                        onClick={() => onDeleteChecklistHabit(habit.id)}
                        className="text-sepia-300 hover:text-red-500 p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                        title="Remove daily habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {checklistHabits.length === 0 && (
                <p className="text-xs text-sepia-400 text-center py-4 font-sans">No daily habits defined. Add one below!</p>
              )}
            </div>

            {/* Quick custom habit addition */}
            <form onSubmit={handleAddHabitSubmit} className="border-t border-dashed border-cream-150 dark:border-sepia-800 pt-2 space-y-1.5 bg-cream-50/30 dark:bg-sepia-850/10 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sepia-400 dark:text-sepia-500 block">Add daily goal habit</span>
              <div className="flex gap-1.5 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  required
                  placeholder="e.g. Apply to a job everyday"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-850 bg-transparent text-sepia-900 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans min-w-[120px]"
                />
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="px-1.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-850 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer"
                >
                  {Object.keys(CATEGORY_METADATA).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={newHabitPoints}
                  onChange={(e) => setNewHabitPoints(Number(e.target.value))}
                  className="px-1.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-850 bg-white dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-mono"
                >
                  <option value={1}>1pt</option>
                  <option value={2}>2pts</option>
                  <option value={3}>3pts</option>
                  <option value={5}>5pts</option>
                  <option value={10}>10pts</option>
                </select>
                <button
                  type="submit"
                  className="p-1.5 bg-readflow-green hover:bg-readflow-green/95 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer shrink-0"
                  title="Add habit"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Today's logged sub-list */}
        <div className="mt-5 pt-4 border-t border-cream-100 dark:border-sepia-800 flex-initial flex flex-col min-h-[140px] max-h-[340px]">
          <h3 className="text-xs font-serif font-bold text-sepia-500 dark:text-sepia-400 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-readflow-gold" />
            Today's Feed List
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
            {todayOpportunities.length === 0 ? (
              <div className="text-center py-6 text-sepia-400 dark:text-sepia-500 text-xs flex flex-col items-center justify-center h-full font-serif italic">
                <span>0 achievements logged today.</span>
                <span className="text-[10px] mt-1 font-sans not-italic">The future is created one small action at a time.</span>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {todayOpportunities.map((opp) => {
                  const meta = CATEGORY_METADATA[opp.category] || CATEGORY_METADATA.Career;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={opp.id}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-cream-50/50 dark:bg-sepia-800/20 border border-cream-150 dark:border-sepia-800/40 text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
                        <span className="text-sepia-750 dark:text-cream-100 font-medium truncate font-sans">
                          {opp.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-readflow-green dark:text-readflow-lightgreen">
                          +{opp.points}
                        </span>
                        <button
                          id={`del-opp-btn-${opp.id}`}
                          onClick={() => onDeleteOpportunity(opp.id)}
                          className="text-sepia-300 hover:text-red-500 p-0.5 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer animate-none"
                          title="Delete opportunity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

