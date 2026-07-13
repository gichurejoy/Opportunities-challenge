/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScoreConfig } from '../types';
import { Sliders, Save, RotateCcw, ShieldAlert, Plus, Trash2, Sparkles, FolderPlus } from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';

interface ScoreSettingsProps {
  scoreConfig: ScoreConfig;
  onUpdateScoreConfig: (config: ScoreConfig) => void;
  onResetScores: () => void;
}

export const ScoreSettings: React.FC<ScoreSettingsProps> = ({
  scoreConfig,
  onUpdateScoreConfig,
  onResetScores,
}) => {
  const [localConfig, setLocalConfig] = useState<ScoreConfig>(JSON.parse(JSON.stringify(scoreConfig)));
  const [selectedCategory, setSelectedCategory] = useState<string>('Career');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // States for adding custom action types
  const [newActionName, setNewActionName] = useState<string>('');
  const [newActionPoints, setNewActionPoints] = useState<number>(3);

  // States for adding custom categories
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);

  const handleSliderChange = (type: string, value: number) => {
    const updated = { ...localConfig };
    if (updated[selectedCategory]) {
      updated[selectedCategory][type] = value;
    }
    setLocalConfig(updated);
    setIsSaved(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    if (localConfig[name]) {
      alert('Category already exists!');
      return;
    }

    const updated = { ...localConfig };
    // Initialize with a default generic activity
    updated[name] = {
      'Logged effort': 3,
    };

    setLocalConfig(updated);
    setSelectedCategory(name);
    setNewCategoryName('');
    setShowAddCategory(false);
    setIsSaved(false);
  };

  const handleAddActionType = (e: React.FormEvent) => {
    e.preventDefault();
    const actionName = newActionName.trim();
    if (!actionName) return;

    if (localConfig[selectedCategory]?.[actionName] !== undefined) {
      alert('Action type already exists in this category!');
      return;
    }

    const updated = { ...localConfig };
    if (!updated[selectedCategory]) {
      updated[selectedCategory] = {};
    }
    updated[selectedCategory][actionName] = newActionPoints;

    setLocalConfig(updated);
    setNewActionName('');
    setNewActionPoints(3);
    setIsSaved(false);
  };

  const handleDeleteActionType = (actionName: string) => {
    if (window.confirm(`Are you sure you want to delete "${actionName}" from scoring?`)) {
      const updated = { ...localConfig };
      if (updated[selectedCategory]) {
        delete updated[selectedCategory][actionName];
      }
      setLocalConfig(updated);
      setIsSaved(false);
    }
  };

  const handleDeleteCategory = (catName: string) => {
    if (Object.keys(localConfig).length <= 1) {
      alert('You must keep at least one category!');
      return;
    }
    if (window.confirm(`Are you sure you want to completely delete the category "${catName}" and all its score metrics?`)) {
      const updated = { ...localConfig };
      delete updated[catName];
      setLocalConfig(updated);
      
      // Select the first remaining category
      const remainingCats = Object.keys(updated);
      setSelectedCategory(remainingCats[0] || 'Career');
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    onUpdateScoreConfig(localConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const currentCategoryScores = localConfig[selectedCategory] || {};
  const currentMeta = CATEGORY_METADATA[selectedCategory] || {
    icon: Sparkles,
    color: '#3d617a',
    bg: 'bg-cream-50/50 dark:bg-sepia-900/40',
    border: 'border-cream-200 dark:border-sepia-800',
    text: 'text-sepia-800 dark:text-cream-100',
  };
  const CategoryIcon = currentMeta.icon;

  return (
    <div id="score-settings-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-readflow-gold" />
            Opportunity Score Config
          </h2>
          <div className="flex gap-2">
            <button
              id="btn-reset-scores"
              type="button"
              onClick={() => {
                if (window.confirm('Reset all scores to system defaults? This will overwrite your customized point allocations.')) {
                  onResetScores();
                  // Re-sync local state
                  setTimeout(() => {
                    setLocalConfig(JSON.parse(JSON.stringify(scoreConfig)));
                  }, 100);
                }
              }}
              className="text-xs font-bold text-sepia-700 dark:text-cream-200 bg-cream-50 dark:bg-sepia-800 hover:bg-cream-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              title="Reset defaults"
            >
              Reset
            </button>
            <button
              id="btn-save-scores"
              type="button"
              onClick={handleSave}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-650 text-white'
                  : 'bg-readflow-green hover:bg-readflow-green/90 dark:bg-readflow-olive dark:hover:bg-readflow-olive/90 text-cream-100'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {isSaved ? 'Saved!' : 'Save Config'}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-sepia-450 dark:text-sepia-500 mb-4 font-sans font-medium">
          Configure categories, append custom actions, and align the scoring metrics with your personal goals.
        </p>

        {/* Category Switcher Tabs */}
        <div className="flex flex-col gap-2.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-wider">
              Scoring Categories
            </span>
            <button
              id="btn-toggle-add-cat"
              type="button"
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-[10px] font-bold text-readflow-green dark:text-readflow-lightgreen flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {showAddCategory ? 'Cancel' : 'Add Category'}
            </button>
          </div>

          {/* Add Category Form */}
          {showAddCategory && (
            <form onSubmit={handleAddCategory} className="flex gap-2 p-2 rounded-xl bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-800/40">
              <input
                id="new-category-name"
                type="text"
                placeholder="e.g. Creative, Real Estate..."
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-readflow-green hover:bg-readflow-olive text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Create
              </button>
            </form>
          )}

          <div className="flex overflow-x-auto gap-1 pb-2 scrollbar-thin">
            {Object.keys(localConfig).map((cat) => {
              const isSelected = selectedCategory === cat;
              const meta = CATEGORY_METADATA[cat] || {
                icon: Sparkles,
                color: '#5c6b73',
                bg: 'bg-cream-50/60 dark:bg-sepia-850/20',
                border: 'border-cream-200/50 dark:border-sepia-850',
                text: 'text-sepia-650 dark:text-cream-200',
              };
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  type="button"
                  id={`score-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? `${meta.bg} ${meta.border} text-sepia-800 dark:text-cream-100 border-2 shadow-sm font-black`
                      : 'border-transparent hover:bg-cream-50 dark:hover:bg-sepia-800 text-sepia-400 hover:text-sepia-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Specific Control Panel */}
        <div className="mb-4 flex items-center justify-between p-2 rounded-xl bg-cream-50/30 dark:bg-sepia-800/10 border border-cream-150/60 dark:border-sepia-800/30">
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4" style={{ color: currentMeta.color }} />
            <span className="text-xs font-bold text-sepia-850 dark:text-cream-100">
              Editing: {selectedCategory}
            </span>
          </div>
          {/* Prevent deleting seeded standard categories */}
          {!['Career', 'Business', 'Learning', 'Health', 'Finance', 'Personal', 'Side Projects', 'Farming'].includes(selectedCategory) && (
            <button
              type="button"
              onClick={() => handleDeleteCategory(selectedCategory)}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Delete Category
            </button>
          )}
        </div>

        {/* Sliders list & Add Custom Action */}
        <div className="space-y-4">
          <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
            {Object.keys(currentCategoryScores).length === 0 ? (
              <p className="text-xs text-sepia-400 italic text-center py-4">No scored action types configured.</p>
            ) : (
              Object.entries(currentCategoryScores).map(([type, score]) => (
                <div key={type} className="space-y-1 p-2 rounded-lg bg-cream-50/50 dark:bg-sepia-800/10 border border-cream-150 dark:border-sepia-850/50 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sepia-800 dark:text-cream-100 truncate pr-2" title={type}>
                      {type}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold bg-cream-100 dark:bg-sepia-800 px-2 py-0.5 rounded text-[10px] text-sepia-800 dark:text-cream-100">
                        {score} pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteActionType(type)}
                        className="text-sepia-400 hover:text-red-500 p-0.5 transition-all cursor-pointer"
                        title="Delete action type"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={score}
                      onChange={(e) => handleSliderChange(type, Number(e.target.value))}
                      className="flex-1 h-1 bg-cream-200 dark:bg-sepia-700 rounded-lg appearance-none cursor-pointer accent-readflow-green dark:accent-readflow-lightgreen"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add custom action type in current category */}
          <form onSubmit={handleAddActionType} className="border-t border-cream-150/60 dark:border-sepia-850/60 pt-3 space-y-2">
            <span className="text-[10px] font-bold text-sepia-400 dark:text-sepia-500 uppercase tracking-wider block">
              Add Scored Action to {selectedCategory}
            </span>
            <div className="flex gap-2">
              <input
                id="new-action-type-name"
                type="text"
                placeholder="e.g. Read Whitepaper, Run experiment..."
                required
                value={newActionName}
                onChange={(e) => setNewActionName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none"
              />
              <div className="flex items-center gap-1.5 bg-cream-50 dark:bg-sepia-800 border border-cream-200 dark:border-sepia-800 px-2.5 rounded-xl">
                <span className="text-[10px] text-sepia-450 dark:text-sepia-500 font-bold">Pts:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newActionPoints}
                  onChange={(e) => setNewActionPoints(Number(e.target.value))}
                  className="w-8 bg-transparent text-xs font-mono font-bold text-sepia-800 dark:text-cream-100 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-readflow-green hover:bg-readflow-olive text-cream-100 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1 border-t border-cream-150 dark:border-sepia-800 pt-3">
        <ShieldAlert className="w-3.5 h-3.5 text-sepia-400 shrink-0" />
        Note: Modifying weights only affects future logged opportunities.
      </div>
    </div>
  );
};
