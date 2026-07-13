/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vision } from '../types';
import { Target, CheckCircle2, Plus, Sparkles, FolderOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisionsProps {
  visions: Vision[];
  onAddVision: (vision: Omit<Vision, 'id' | 'completedPoints' | 'isCompleted'>) => void;
  onDeleteVision: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSelectVision?: (id: string) => void;
}

export const Visions: React.FC<VisionsProps> = ({
  visions,
  onAddVision,
  onDeleteVision,
  onToggleComplete,
  onSelectVision,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetPoints, setNewTargetPoints] = useState(100);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const CATEGORIES = ['Career', 'Business', 'Learning', 'Finance', 'Health', 'Personal', 'Side Projects', 'Farming'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddVision({
      title: newTitle.trim(),
      description: newDescription.trim(),
      targetPoints: Number(newTargetPoints) || 100,
      supportingCategories: selectedCategories.length > 0 ? selectedCategories : ['Career'],
      supportingTypes: [],
    });

    setNewTitle('');
    setNewDescription('');
    setNewTargetPoints(100);
    setSelectedCategories([]);
    setIsCreating(false);
  };

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div id="visions-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-start gap-4 transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-readflow-gold" />
            Vision Progress
          </h2>
          <button
            id="toggle-create-vision-btn"
            onClick={() => setIsCreating(!isCreating)}
            className="text-xs font-bold text-sepia-700 dark:text-cream-200 bg-cream-50 dark:bg-sepia-800 px-3 py-1.5 rounded-full hover:bg-cream-100 dark:hover:bg-sepia-700 transition-all cursor-pointer"
          >
            {isCreating ? 'View Visions' : 'Add Vision'}
          </button>
        </div>
        <p className="text-xs text-sepia-400 dark:text-sepia-500 mb-4 font-sans font-medium">
          Connect your daily actions directly to your long-term ambitions.
        </p>
      </div>

      {isCreating ? (
        <form id="create-vision-form" onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-start gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-sepia-400 dark:text-sepia-500 mb-1">
                Vision Statement / Ambition
              </label>
              <input
                id="vision-title-input"
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Become Senior Software Engineer"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-400 dark:text-sepia-500 mb-1">
                Description / Purpose
              </label>
              <textarea
                id="vision-desc-textarea"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="What does achieving this mean to you?"
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-400 dark:text-sepia-500 mb-1">
                Target Score Points
              </label>
              <input
                id="vision-points-input"
                type="number"
                min="10"
                max="5000"
                required
                value={newTargetPoints}
                onChange={(e) => setNewTargetPoints(Number(e.target.value))}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-400 dark:text-sepia-500 mb-1.5">
                Supporting Categories
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      id={`vision-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`py-1.5 px-2 rounded-lg border text-center text-[10px] font-semibold transition-all truncate cursor-pointer ${
                        isChecked
                          ? 'bg-readflow-green/10 dark:bg-readflow-olive/20 border-readflow-green dark:border-readflow-olive text-readflow-green dark:text-readflow-lightgreen font-bold border-2'
                          : 'border-cream-100 dark:border-sepia-800 hover:border-cream-200 text-sepia-400 hover:text-sepia-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            id="vision-submit-btn"
            type="submit"
            className="w-full bg-readflow-green hover:bg-readflow-green/90 dark:bg-readflow-olive dark:hover:bg-readflow-olive/90 text-cream-100 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-4"
          >
            Create Ambition Roadmap
          </button>
        </form>
      ) : (
        <div className="flex-1 space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {visions.length === 0 ? (
            <div className="text-center py-12 text-sepia-400 italic text-xs">
              No visions configured. Add your first big dream!
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {visions.map((vision) => {
                const percentage = Math.min(100, Math.round((vision.completedPoints / vision.targetPoints) * 100));
                
                // Construct bullet requirements based on pre-seeded examples or defaults
                const supportsList = vision.title.includes('Software') 
                  ? ['112 coding sessions', '18 projects', 'AWS certification', '42 job applications', 'Portfolio updated']
                  : vision.title.includes('Farm')
                    ? ['4 farm visits', 'Save KSh 50,000', 'Buy seed tray incubator']
                    : [`Supported by ${vision.supportingCategories.join(', ')} efforts`];

                return (
                  <motion.div
                    key={vision.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    onClick={() => onSelectVision?.(vision.id)}
                    className="p-4 rounded-xl border border-cream-150 dark:border-sepia-800 bg-cream-50/50 dark:bg-sepia-850/10 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-readflow-green/40 dark:hover:border-readflow-olive/40 transition-all duration-300 group/card"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          id={`vision-toggle-btn-${vision.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(vision.id);
                          }}
                          className="text-sepia-400 hover:text-readflow-green transition-all cursor-pointer"
                          title="Mark completed"
                        >
                          <CheckCircle2 className={`w-5 h-5 ${vision.isCompleted ? 'text-readflow-green fill-cream-50 dark:fill-sepia-900' : ''}`} />
                        </button>
                        <span className={`text-xs font-bold text-sepia-800 dark:text-cream-100 ${vision.isCompleted ? 'line-through text-sepia-400' : ''}`}>
                          {vision.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono font-bold text-readflow-green dark:text-readflow-lightgreen bg-readflow-green/10 dark:bg-readflow-olive/20 px-1.5 py-0.5 rounded opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Details →
                        </span>
                        <button
                          id={`vision-delete-btn-${vision.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVision(vision.id);
                          }}
                          className="text-sepia-300 hover:text-red-500 p-0.5 rounded transition-all cursor-pointer"
                          title="Delete ambition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {vision.description && (
                      <p className="text-[10px] text-sepia-500 dark:text-sepia-400 mb-3 pl-7 font-sans font-medium">
                        {vision.description}
                      </p>
                    )}

                    {/* Progress slider */}
                    <div className="space-y-1.5 pl-7">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-sepia-400 dark:text-sepia-500 font-semibold">Supporting Efforts</span>
                        <span className="font-mono font-bold text-sepia-700 dark:text-cream-100">
                          {vision.completedPoints} / {vision.targetPoints} pts ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-cream-100 dark:bg-sepia-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-readflow-green dark:bg-readflow-lightgreen h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Supporting details checklist */}
                    <div className="mt-3 pl-7 space-y-1">
                      {supportsList.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[9px] text-sepia-400 dark:text-sepia-500 font-sans font-medium">
                          <CheckCircle2 className="w-3 h-3 text-readflow-green" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {!isCreating && (
        <div className="mt-2 text-[10px] text-sepia-400 dark:text-sepia-500 text-center flex items-center justify-center gap-1">
          <FolderOpen className="w-3.5 h-3.5 text-sepia-400" />
          Visions dynamically aggregate points from matching categories.
        </div>
      )}
    </div>
  );
};
