/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OpportunityPipeline, PipelineStage } from '../types';
import { 
  GitBranch, 
  ChevronRight, 
  Check, 
  Plus, 
  Trophy, 
  Archive, 
  CornerDownRight, 
  Trash2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Building,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PipelineProps {
  pipelines: OpportunityPipeline[];
  onAddPipeline: (pipeline: Omit<OpportunityPipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePipeline: (pipeline: OpportunityPipeline) => void;
  onDeletePipeline: (id: string) => void;
  activePipelineId?: string;
  onSelectPipeline?: (id: string) => void;
}

const TEMPLATES = [
  {
    name: 'Client Proposal',
    type: 'Business' as const,
    category: 'Business',
    stages: ['Created', 'Sent', 'Waiting', 'Meeting Scheduled', 'Negotiation', 'Won 🎉'],
  },
  {
    name: 'Job Interview',
    type: 'Job' as const,
    category: 'Career',
    stages: ['Applied', 'Assessment', 'Interview', 'Offer'],
  },
  {
    name: 'Scholarship / Grant',
    type: 'Scholarship' as const,
    category: 'Career',
    stages: ['Submitted', 'Review', 'Interview', 'Accepted'],
  },
];

export const Pipeline: React.FC<PipelineProps> = ({
  pipelines,
  onAddPipeline,
  onUpdatePipeline,
  onDeletePipeline,
  activePipelineId,
  onSelectPipeline,
}) => {
  const [localSelectedId, setLocalSelectedId] = useState<string>('');
  
  const currentSelectedId = activePipelineId || localSelectedId || pipelines[0]?.id || '';
  
  const updateSelectedId = (id: string) => {
    if (onSelectPipeline) {
      onSelectPipeline(id);
    } else {
      setLocalSelectedId(id);
    }
  };

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCompanyOrClient, setNewCompanyOrClient] = useState<string>('');
  const [newExpectedValue, setNewExpectedValue] = useState<string>('');
  const [newTemplateIdx, setNewTemplateIdx] = useState<number>(0);
  const [newCustomStages, setNewCustomStages] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [expandedStageIdx, setExpandedStageIdx] = useState<number | null>(null);
  const [newChecklistTexts, setNewChecklistTexts] = useState<{ [key: number]: string }>({});

  const selectedPipeline = pipelines.find((p) => p.id === currentSelectedId) || pipelines[0];

  React.useEffect(() => {
    if (selectedPipeline) {
      setExpandedStageIdx(selectedPipeline.currentStageIndex);
    }
  }, [selectedPipeline?.id, selectedPipeline?.currentStageIndex]);

  const handleAddChecklistItem = (stageIndex: number) => {
    const text = newChecklistTexts[stageIndex] || '';
    if (!text.trim()) return;

    const updatedStages = [...selectedPipeline.stages];
    const stage = updatedStages[stageIndex];
    const checklist = [...(stage.checklist || [])];
    checklist.push({
      id: `item-${Date.now()}`,
      text: text.trim(),
      isCompleted: false,
    });
    updatedStages[stageIndex] = {
      ...stage,
      checklist,
    };

    onUpdatePipeline({
      ...selectedPipeline,
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    });

    setNewChecklistTexts((prev) => ({ ...prev, [stageIndex]: '' }));
  };

  const handleToggleChecklistItem = (stageIndex: number, itemId: string) => {
    const updatedStages = [...selectedPipeline.stages];
    const stage = updatedStages[stageIndex];
    const checklist = (stage.checklist || []).map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    updatedStages[stageIndex] = {
      ...stage,
      checklist,
    };

    onUpdatePipeline({
      ...selectedPipeline,
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteChecklistItem = (stageIndex: number, itemId: string) => {
    const updatedStages = [...selectedPipeline.stages];
    const stage = updatedStages[stageIndex];
    const checklist = (stage.checklist || []).filter((item) => item.id !== itemId);
    updatedStages[stageIndex] = {
      ...stage,
      checklist,
    };

    onUpdatePipeline({
      ...selectedPipeline,
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCreatePipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const template = TEMPLATES[newTemplateIdx];
    let stageNames = template.stages;

    if (newTemplateIdx === -1 && newCustomStages.trim()) {
      stageNames = newCustomStages.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const stages: PipelineStage[] = stageNames.map((name, idx) => ({
      name,
      completedAt: idx === 0 ? new Date().toISOString() : undefined, // Start with first stage completed
    }));

    onAddPipeline({
      title: newTitle.trim(),
      type: newTemplateIdx === -1 ? 'Custom' : template.type,
      category: newTemplateIdx === -1 ? 'Career' : template.category,
      companyOrClient: newCompanyOrClient.trim() || undefined,
      expectedValue: newExpectedValue.trim() || undefined,
      stages,
      currentStageIndex: 0,
      status: 'active',
      notes: newNotes.trim() || 'Initialized pipeline.',
    });

    setNewTitle('');
    setNewCompanyOrClient('');
    setNewExpectedValue('');
    setNewNotes('');
    setNewCustomStages('');
    setIsCreating(false);
  };

  const handleAdvanceStage = (pipeline: OpportunityPipeline) => {
    if (pipeline.currentStageIndex >= pipeline.stages.length - 1) return;

    const nextIndex = pipeline.currentStageIndex + 1;
    const updatedStages = [...pipeline.stages];
    updatedStages[nextIndex] = {
      ...updatedStages[nextIndex],
      completedAt: new Date().toISOString(),
    };

    const isLastStage = nextIndex === pipeline.stages.length - 1;
    const status = isLastStage ? 'won' : 'active';

    onUpdatePipeline({
      ...pipeline,
      stages: updatedStages,
      currentStageIndex: nextIndex,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMarkStatus = (pipeline: OpportunityPipeline, status: 'active' | 'won' | 'lost') => {
    onUpdatePipeline({
      ...pipeline,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateNotes = (pipeline: OpportunityPipeline, notes: string) => {
    onUpdatePipeline({
      ...pipeline,
      notes,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div id="pipeline-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-readflow-gold" />
          Opportunity Pipelines
        </h2>
        <button
          id="btn-toggle-create-pipeline"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1 text-xs font-bold bg-cream-100 hover:bg-cream-150 dark:bg-sepia-800 dark:hover:bg-sepia-750 px-3 py-1.5 rounded-full text-sepia-805 dark:text-cream-200 transition-all cursor-pointer"
        >
          {isCreating ? 'View Active' : <><Plus className="w-3.5 h-3.5" /> Start Pipeline</>}
        </button>
      </div>

      {isCreating ? (
        <form id="create-pipeline-form" onSubmit={handleCreatePipeline} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                Pipeline Name / Target Role
              </label>
              <input
                id="new-pipe-title"
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Senior Backend Role - Microsoft"
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                  Target Company / Client / Institution (Optional)
                </label>
                <input
                  id="new-pipe-company"
                  type="text"
                  value={newCompanyOrClient}
                  onChange={(e) => setNewCompanyOrClient(e.target.value)}
                  placeholder="e.g. Acme Corp, Microsoft, Stanford"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                  Expected Salary / Grant / Value (Optional)
                </label>
                <input
                  id="new-pipe-expected-value"
                  type="text"
                  value={newExpectedValue}
                  onChange={(e) => setNewExpectedValue(e.target.value)}
                  placeholder="e.g. $120k / yr, $25,000 grant"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1.5">
                Workflow Preset Structure
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    id={`tmpl-btn-${idx}`}
                    onClick={() => setNewTemplateIdx(idx)}
                    className={`p-2 rounded-xl border text-center text-[10px] font-semibold transition-all cursor-pointer ${
                      newTemplateIdx === idx
                        ? 'bg-cream-100 dark:bg-sepia-850 border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-readflow-lightgreen border-2 font-bold'
                        : 'border-cream-150 dark:border-sepia-850 hover:border-cream-200'
                    }`}
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            {newTemplateIdx === -1 && (
              <div>
                <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                  Custom Stages (comma-separated list)
                </label>
                <input
                  id="new-pipe-custom-stages"
                  type="text"
                  required
                  value={newCustomStages}
                  onChange={(e) => setNewCustomStages(e.target.value)}
                  placeholder="e.g. Lead Sourced, Contacted, Meeting, Won"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                Context / Private Notes
              </label>
              <textarea
                id="new-pipe-notes"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Initial background details or next actions required."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-none font-sans"
              />
            </div>
          </div>

          <button
            id="new-pipe-submit-btn"
            type="submit"
            className="w-full bg-readflow-green text-cream-50 py-2.5 rounded-xl text-xs font-bold hover:bg-readflow-olive transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-4"
          >
            Create Pipeline Lifecycle
          </button>
        </form>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-[300px]">
          {/* Pipelines select list */}
          <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-cream-150 dark:border-sepia-850 pb-3 sm:pb-0 sm:pr-3 flex flex-row sm:flex-col gap-1.5 sm:space-y-1.5 overflow-x-auto sm:overflow-y-auto max-h-[140px] sm:max-h-[380px] shrink-0">
            {pipelines.length === 0 ? (
              <p className="text-xs text-sepia-400 italic text-center py-6 w-full">No active pipelines.</p>
            ) : (
              pipelines.map((pipe) => {
                const isSelected = selectedPipeline?.id === pipe.id;
                return (
                  <button
                    key={pipe.id}
                    id={`pipe-select-${pipe.id}`}
                    onClick={() => updateSelectedId(pipe.id)}
                    className={`shrink-0 w-[160px] sm:w-full p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cream-50 dark:bg-sepia-800/30 border-cream-200 dark:border-sepia-800 shadow-sm font-semibold scale-[1.01]'
                        : 'border-transparent hover:bg-cream-50/50 dark:hover:bg-sepia-800/10'
                    }`}
                  >
                    <div>
                      <span className="text-xs text-sepia-800 dark:text-cream-100 truncate font-bold block w-full">
                        {pipe.title}
                      </span>
                      {pipe.companyOrClient && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 font-medium truncate mt-0.5">
                          <Building className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{pipe.companyOrClient}</span>
                        </div>
                      )}
                      {pipe.expectedValue && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono truncate mt-0.5">
                          <Coins className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{pipe.expectedValue}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[9px] text-sepia-450 w-full">
                      <span className="bg-cream-100 dark:bg-sepia-850 px-1.5 py-0.2 rounded font-semibold text-sepia-700 dark:text-cream-200">
                        {pipe.type}
                      </span>
                      <span className={`font-bold capitalize ${
                        pipe.status === 'won' ? 'text-readflow-green' : pipe.status === 'lost' ? 'text-red-500' : 'text-readflow-gold'
                      }`}>
                        {pipe.status === 'won' ? 'Won 🎉' : pipe.status === 'lost' ? 'Lost' : `Stage ${pipe.currentStageIndex + 1}/${pipe.stages.length}`}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active workflow steps tracker */}
          <div className="flex-1 flex flex-col justify-start pl-1 mt-2 sm:mt-0">
            {selectedPipeline ? (
              <div className="flex-1 flex flex-col justify-start gap-4">
                <div className="space-y-4">
                  {/* Pipeline Header */}
                  <div className="flex items-start justify-between border-b border-cream-150 dark:border-sepia-850 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-sepia-850 dark:text-cream-100">
                          {selectedPipeline.title}
                        </h3>
                        <span className="bg-cream-100 dark:bg-sepia-850 px-2 py-0.5 rounded text-[10px] font-bold text-sepia-700 dark:text-cream-200">
                          {selectedPipeline.type}
                        </span>
                        {selectedPipeline.companyOrClient && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60 font-sans">
                            <Building className="w-3 h-3 text-amber-600" />
                            {selectedPipeline.companyOrClient}
                          </span>
                        )}
                        {selectedPipeline.expectedValue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 font-mono">
                            <Coins className="w-3 h-3 text-emerald-600" />
                            {selectedPipeline.expectedValue}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-sepia-400 dark:text-sepia-550 mt-1 font-medium font-sans">
                        Created {new Date(selectedPipeline.createdAt).toLocaleDateString()} • Updated {new Date(selectedPipeline.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      id={`del-pipe-btn-${selectedPipeline.id}`}
                      onClick={() => {
                        onDeletePipeline(selectedPipeline.id);
                        if (pipelines.length > 1) {
                          updateSelectedId(pipelines.find((p) => p.id !== selectedPipeline.id)?.id || '');
                        }
                      }}
                      className="text-sepia-400 hover:text-red-500 p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-850 transition-all cursor-pointer"
                      title="Archive/Delete pipeline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Horizontal workflow steps */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-sepia-450 dark:text-sepia-500 flex items-center gap-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-sepia-400" />
                      Active Workflow Lifecycle
                    </h4>
                    <div className="flex flex-col gap-3 pl-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-cream-200 before:dark:bg-sepia-850">
                      {selectedPipeline.stages.map((stage, idx) => {
                        const isCompleted = idx <= selectedPipeline.currentStageIndex;
                        const isCurrent = idx === selectedPipeline.currentStageIndex;
                        const isExpanded = expandedStageIdx === idx;
                        const items = stage.checklist || [];
                        const completedItems = items.filter(item => item.isCompleted).length;

                        return (
                          <div key={stage.name} className="flex flex-col gap-1.5 text-xs">
                            <div 
                              onClick={() => setExpandedStageIdx(isExpanded ? null : idx)}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 z-10 font-mono text-[9px] transition-all ${
                                isCompleted
                                  ? 'bg-readflow-green border-readflow-green text-cream-50 shadow-sm font-bold'
                                  : 'bg-white dark:bg-sepia-900 border-cream-300 dark:border-sepia-700 text-sepia-400'
                              }`}>
                                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                              </div>
                              <div className="flex-1 flex justify-between items-center min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`font-bold truncate transition-all group-hover:text-readflow-green ${
                                    isCurrent 
                                      ? 'text-readflow-green dark:text-readflow-lightgreen font-extrabold scale-[1.01]' 
                                      : isCompleted 
                                        ? 'text-sepia-700 dark:text-cream-350 font-semibold' 
                                        : 'text-sepia-400 dark:text-sepia-600'
                                  }`}>
                                    {stage.name}
                                  </span>
                                  {items.length > 0 && (
                                    <span className="text-[9px] font-mono font-bold bg-cream-100 dark:bg-sepia-850 text-sepia-500 dark:text-cream-300 px-1.5 py-0.2 rounded">
                                      {completedItems}/{items.length} Tasks
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {stage.completedAt && (
                                    <span className="text-[9px] text-sepia-400 dark:text-sepia-500 font-medium font-mono mr-1">
                                      {new Date(stage.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-sepia-400" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-sepia-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expandable Checklist Section */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-7 overflow-hidden bg-cream-50/40 dark:bg-sepia-850/10 border border-cream-150 dark:border-sepia-850 p-2.5 rounded-xl space-y-2 mt-0.5"
                                >
                                  {items.length === 0 ? (
                                    <p className="text-[10px] text-sepia-400 italic">No stage items configured yet.</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                                      {items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-2 text-[11px] group/item">
                                          <label className="flex items-center gap-2 font-medium text-sepia-700 dark:text-cream-250 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={item.isCompleted}
                                              onChange={() => handleToggleChecklistItem(idx, item.id)}
                                              className="w-3.5 h-3.5 rounded text-readflow-green border-cream-300 dark:border-sepia-700 focus:ring-0 cursor-pointer"
                                            />
                                            <span className={item.isCompleted ? 'line-through text-sepia-400 dark:text-sepia-550 font-normal' : ''}>
                                              {item.text}
                                            </span>
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteChecklistItem(idx, item.id)}
                                            className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:text-red-500 transition-all cursor-pointer"
                                            title="Delete sub-task"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add Checklist Item Form */}
                                  <div className="flex gap-1.5 border-t border-cream-150/60 dark:border-sepia-850/60 pt-2">
                                    <input
                                      type="text"
                                      placeholder="Add critical milestone task..."
                                      value={newChecklistTexts[idx] || ''}
                                      onChange={(e) => setNewChecklistTexts(prev => ({ ...prev, [idx]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddChecklistItem(idx);
                                        }
                                      }}
                                      className="flex-1 bg-white dark:bg-sepia-900 px-2 py-1 text-[10px] rounded-lg border border-cream-200 dark:border-sepia-800 text-sepia-800 dark:text-cream-100 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAddChecklistItem(idx)}
                                      className="bg-readflow-green hover:bg-readflow-olive text-cream-100 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer transition-all shrink-0"
                                    >
                                      Add
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes / Comments */}
                  <div>
                    <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1.5">
                      Private Notes & Logs
                    </label>
                    <textarea
                      id={`notes-textarea-${selectedPipeline.id}`}
                      value={selectedPipeline.notes}
                      onChange={(e) => handleUpdateNotes(selectedPipeline, e.target.value)}
                      placeholder="Type details, correspondence summaries, next actions, etc."
                      rows={2}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/30 dark:bg-sepia-800/20 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-none font-sans"
                    />
                  </div>
                </div>

                {/* Stepping controls */}
                <div className="border-t border-cream-150 dark:border-sepia-850 pt-3 mt-4 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {selectedPipeline.status === 'active' ? (
                      <>
                        <button
                          id={`btn-fail-${selectedPipeline.id}`}
                          onClick={() => handleMarkStatus(selectedPipeline, 'lost')}
                          className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 transition-all font-bold cursor-pointer"
                        >
                          Mark Lost
                        </button>
                        <button
                          id={`btn-win-${selectedPipeline.id}`}
                          onClick={() => handleMarkStatus(selectedPipeline, 'won')}
                          className="px-3 py-1.5 rounded-lg border border-cream-200 dark:border-sepia-850 text-readflow-olive dark:text-readflow-lightgreen hover:bg-cream-50 dark:hover:bg-sepia-850/40 transition-all font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5" /> Won 🎉
                        </button>
                      </>
                    ) : (
                      <button
                        id={`btn-reopen-${selectedPipeline.id}`}
                        onClick={() => handleMarkStatus(selectedPipeline, 'active')}
                        className="px-3 py-1.5 rounded-lg border border-cream-300 dark:border-sepia-700 text-sepia-500 dark:text-cream-350 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all font-bold cursor-pointer"
                      >
                        Re-open Lifecycle
                      </button>
                    )}
                  </div>

                  {selectedPipeline.currentStageIndex < selectedPipeline.stages.length - 1 && selectedPipeline.status === 'active' && (
                    <button
                      id={`btn-advance-${selectedPipeline.id}`}
                      onClick={() => handleAdvanceStage(selectedPipeline)}
                      className="bg-readflow-green hover:bg-readflow-olive text-cream-50 px-4 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      Advance to Next Stage
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-sepia-400 italic py-12">
                <AlertCircle className="w-8 h-8 text-cream-300 dark:text-sepia-750 mb-2" />
                <p>No pipeline selected. Start creating one now!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
