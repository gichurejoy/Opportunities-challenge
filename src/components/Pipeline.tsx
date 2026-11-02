/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Opportunity, OpportunityPipeline, PipelineStage } from '../types';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronLeft,
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
  Coins,
  LayoutList,
  Columns3,
  Link,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryFieldConfig } from '../utils/categoryFields';
import { CATEGORY_PIPELINE_TEMPLATES, getStagesForCategory } from '../utils/pipelineStages';

interface PipelineProps {
  pipelines: OpportunityPipeline[];
  opportunities?: Opportunity[];
  onAddPipeline: (pipeline: Omit<OpportunityPipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePipeline: (pipeline: OpportunityPipeline) => void;
  onDeletePipeline: (id: string) => void;
  onUpdateOpportunity?: (opp: Opportunity) => void;
  activePipelineId?: string;
  onSelectPipeline?: (id: string) => void;
}

export function parseMonetaryValue(val?: string): { amount: number; symbol: string } {
  if (!val || typeof val !== 'string') return { amount: 0, symbol: '' };
  
  let symbol = '$';
  if (val.includes('KSh') || val.includes('KES')) symbol = 'KSh ';
  else if (val.includes('€')) symbol = '€';
  else if (val.includes('£')) symbol = '£';
  else if (val.includes('¥')) symbol = '¥';
  else if (val.includes('$')) symbol = '$';
  else symbol = '';

  const clean = val.toLowerCase().replace(/,/g, '').trim();
  const match = clean.match(/([\d.]+)\s*([km])?/);
  if (!match) return { amount: 0, symbol };

  let num = parseFloat(match[1]);
  if (isNaN(num)) return { amount: 0, symbol };

  if (match[2] === 'k') num *= 1000;
  if (match[2] === 'm') num *= 1000000;

  return { amount: num, symbol };
}

export function formatMonetaryValue(amount: number, symbol = '$'): string {
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  }
  return `${symbol}${amount.toLocaleString()}`;
}

const TEMPLATES = Object.values(CATEGORY_PIPELINE_TEMPLATES).map((tmpl) => ({
  name: tmpl.name,
  type: tmpl.type,
  category: tmpl.category,
  stages: tmpl.stages,
}));

export const Pipeline: React.FC<PipelineProps> = ({
  pipelines,
  opportunities,
  onAddPipeline,
  onUpdatePipeline,
  onDeletePipeline,
  onUpdateOpportunity,
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

  // View mode and Kanban states
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [kanbanCategory, setKanbanCategory] = useState<string>('All');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const activeCategory = newTemplateIdx >= 0 && TEMPLATES[newTemplateIdx] ? TEMPLATES[newTemplateIdx].category : 'Career';
  const pipelineFieldConfig = getCategoryFieldConfig(activeCategory);

  const selectedPipeline = pipelines.find((p) => p.id === currentSelectedId) || pipelines[0];

  React.useEffect(() => {
    if (selectedPipeline) {
      setExpandedStageIdx(selectedPipeline.currentStageIndex);
    }
  }, [selectedPipeline?.id, selectedPipeline?.currentStageIndex]);

  // Monetary pipeline calculations
  const monetarySummary = useMemo(() => {
    let activeTotal = 0;
    let wonTotal = 0;
    let currencySymbol = '$';

    pipelines.forEach((p) => {
      const parsed = parseMonetaryValue(p.expectedValue);
      if (parsed.symbol) currencySymbol = parsed.symbol;
      if (p.status === 'won') {
        wonTotal += parsed.amount;
      } else if (p.status === 'active') {
        activeTotal += parsed.amount;
      }
    });

    const activeCount = pipelines.filter((p) => p.status === 'active').length;
    const wonCount = pipelines.filter((p) => p.status === 'won').length;
    const lostCount = pipelines.filter((p) => p.status === 'lost').length;
    const closedCount = wonCount + lostCount;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    return {
      activeTotal,
      wonTotal,
      currencySymbol,
      activeCount,
      wonCount,
      lostCount,
      winRate,
    };
  }, [pipelines]);

  // Linked Opportunity helper for current selected pipeline
  const linkedOpportunity = useMemo(() => {
    if (!selectedPipeline?.linkedOpportunityId || !opportunities) return null;
    return opportunities.find((o) => o.id === selectedPipeline.linkedOpportunityId) || null;
  }, [selectedPipeline?.linkedOpportunityId, opportunities]);

  const handleLinkOpportunity = (pipeline: OpportunityPipeline, oppId: string) => {
    const opp = opportunities?.find((o) => o.id === oppId);
    if (!opp) return;

    onUpdatePipeline({
      ...pipeline,
      linkedOpportunityId: opp.id,
      updatedAt: new Date().toISOString(),
    });

    if (onUpdateOpportunity) {
      onUpdateOpportunity({
        ...opp,
        pipelineId: pipeline.id,
        stage: pipeline.status === 'won'
          ? pipeline.stages[pipeline.stages.length - 1]?.name || 'Won 🎉'
          : pipeline.status === 'lost'
          ? 'Lost'
          : pipeline.stages[pipeline.currentStageIndex]?.name || opp.stage,
      });
    }
  };

  const handleUnlinkOpportunity = (pipeline: OpportunityPipeline) => {
    const linkedId = pipeline.linkedOpportunityId;
    onUpdatePipeline({
      ...pipeline,
      linkedOpportunityId: undefined,
      updatedAt: new Date().toISOString(),
    });

    if (linkedId && onUpdateOpportunity && opportunities) {
      const opp = opportunities.find((o) => o.id === linkedId);
      if (opp) {
        onUpdateOpportunity({
          ...opp,
          pipelineId: undefined,
        });
      }
    }
  };

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
      completedAt: idx === 0 ? new Date().toISOString() : undefined,
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

  const handleStepBack = (pipeline: OpportunityPipeline) => {
    if (pipeline.currentStageIndex <= 0) return;
    const prevIndex = pipeline.currentStageIndex - 1;
    onUpdatePipeline({
      ...pipeline,
      currentStageIndex: prevIndex,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSetCurrentStage = (pipeline: OpportunityPipeline, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= pipeline.stages.length) return;
    const updatedStages = [...pipeline.stages];
    for (let i = 0; i <= targetIndex; i++) {
      if (!updatedStages[i].completedAt) {
        updatedStages[i] = { ...updatedStages[i], completedAt: new Date().toISOString() };
      }
    }
    const isLastStage = targetIndex === pipeline.stages.length - 1;
    const status = isLastStage ? 'won' : 'active';
    onUpdatePipeline({
      ...pipeline,
      stages: updatedStages,
      currentStageIndex: targetIndex,
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

  // Helper to determine effective current stage name for any pipeline
  const getPipelineStageName = (p: OpportunityPipeline): string => {
    if (p.status === 'won') return p.stages[p.stages.length - 1]?.name || 'Won 🎉';
    if (p.status === 'lost') return 'Lost';
    return p.stages[p.currentStageIndex]?.name || p.stages[0]?.name || 'Active';
  };

  // Kanban Columns
  const kanbanColumns = useMemo(() => {
    if (kanbanCategory === 'All') {
      return ['Sourced', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Won 🎉', 'Lost'];
    }
    return getStagesForCategory(kanbanCategory);
  }, [kanbanCategory]);

  const filteredPipelines = useMemo(() => {
    if (kanbanCategory === 'All') return pipelines;
    return pipelines.filter((p) => p.category === kanbanCategory);
  }, [pipelines, kanbanCategory]);

  // Check if pipeline belongs to column
  const doesPipelineMatchColumn = (p: OpportunityPipeline, colName: string): boolean => {
    const stage = getPipelineStageName(p).toLowerCase();
    const col = colName.toLowerCase();
    if (stage === col) return true;

    if (col.includes('won') && (p.status === 'won' || stage.includes('won') || stage.includes('awarded') || stage.includes('paid') || stage.includes('completed'))) {
      return true;
    }
    if (col.includes('lost') && (p.status === 'lost' || stage.includes('lost') || stage.includes('dropped') || stage.includes('not selected'))) {
      return true;
    }

    if (kanbanCategory === 'All') {
      if (col === 'sourced' && (stage.includes('sourced') || stage.includes('identified') || stage.includes('lead') || stage.includes('pitch') || stage.includes('planning') || stage.includes('ideation'))) return true;
      if (col === 'applied' && (stage.includes('applied') || stage.includes('preparing') || stage.includes('submitted') || stage.includes('scope') || stage.includes('enrolled'))) return true;
      if (col === 'screening' && (stage.includes('screening') || stage.includes('assessment') || stage.includes('in review') || stage.includes('in progress'))) return true;
      if (col === 'interviewing' && (stage.includes('interview') || stage.includes('discovery') || stage.includes('negotiation') || stage.includes('contract'))) return true;
      if (col === 'offer' && (stage.includes('offer') || stage.includes('finalist') || stage.includes('alpha') || stage.includes('milestone') || stage.includes('review'))) return true;
    }

    return false;
  };

  // Drop handler for dragging cards across columns
  const handleDropOnColumn = (e: React.DragEvent, colName: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const pipeId = e.dataTransfer.getData('text/pipeline-id');
    if (!pipeId) return;
    const targetPipe = pipelines.find((p) => p.id === pipeId);
    if (!targetPipe) return;

    const isWon = colName.toLowerCase().includes('won') || colName.toLowerCase().includes('awarded') || colName.toLowerCase().includes('paid') || colName.toLowerCase().includes('completed');
    const isLost = colName.toLowerCase().includes('lost') || colName.toLowerCase().includes('not selected') || colName.toLowerCase().includes('dropped');

    if (isWon) {
      onUpdatePipeline({
        ...targetPipe,
        status: 'won',
        currentStageIndex: targetPipe.stages.length - 1,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    if (isLost) {
      onUpdatePipeline({
        ...targetPipe,
        status: 'lost',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    let stageIdx = targetPipe.stages.findIndex((s) => s.name.toLowerCase() === colName.toLowerCase());
    if (stageIdx === -1) {
      stageIdx = targetPipe.stages.findIndex((s) => s.name.toLowerCase().includes(colName.toLowerCase()) || colName.toLowerCase().includes(s.name.toLowerCase()));
    }
    if (stageIdx === -1) stageIdx = targetPipe.currentStageIndex;

    const updatedStages = [...targetPipe.stages];
    for (let i = 0; i <= stageIdx; i++) {
      if (!updatedStages[i].completedAt) {
        updatedStages[i] = { ...updatedStages[i], completedAt: new Date().toISOString() };
      }
    }

    onUpdatePipeline({
      ...targetPipe,
      stages: updatedStages,
      currentStageIndex: stageIdx,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div id="pipeline-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full transition-all duration-300">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-readflow-gold" />
            Opportunity Pipelines
          </h2>

          {/* View Mode Toggle: Kanban vs List */}
          {!isCreating && (
            <div className="flex items-center bg-cream-100 dark:bg-sepia-800 p-0.5 rounded-lg border border-cream-200 dark:border-sepia-700">
              <button
                type="button"
                id="btn-kanban-mode"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-sepia-900 text-readflow-green dark:text-readflow-lightgreen shadow-xs'
                    : 'text-sepia-500 dark:text-cream-300 hover:text-sepia-800'
                }`}
                title="Kanban Board View"
              >
                <Columns3 className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                type="button"
                id="btn-list-mode"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-sepia-900 text-readflow-green dark:text-readflow-lightgreen shadow-xs'
                    : 'text-sepia-500 dark:text-cream-300 hover:text-sepia-800'
                }`}
                title="List / Detail Stepper View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          )}
        </div>

        <button
          id="btn-toggle-create-pipeline"
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1 text-xs font-bold bg-cream-100 hover:bg-cream-150 dark:bg-sepia-800 dark:hover:bg-sepia-750 px-3 py-1.5 rounded-full text-sepia-805 dark:text-cream-200 transition-all cursor-pointer self-start sm:self-auto"
        >
          {isCreating ? 'View Active' : <><Plus className="w-3.5 h-3.5" /> Start Pipeline</>}
        </button>
      </div>

      {/* Monetary Pipeline Value Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-cream-50/60 dark:bg-sepia-850/40 p-2.5 rounded-xl border border-cream-200/80 dark:border-sepia-800/80">
          <div className="flex items-center justify-between text-sepia-450 dark:text-sepia-500 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Active Pipeline</span>
            <Coins className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono truncate">
            {formatMonetaryValue(monetarySummary.activeTotal, monetarySummary.currencySymbol)}
          </div>
          <span className="text-[9px] text-sepia-400 font-medium">
            {monetarySummary.activeCount} deal{monetarySummary.activeCount === 1 ? '' : 's'} in motion
          </span>
        </div>

        <div className="bg-cream-50/60 dark:bg-sepia-850/40 p-2.5 rounded-xl border border-cream-200/80 dark:border-sepia-800/80">
          <div className="flex items-center justify-between text-sepia-450 dark:text-sepia-500 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Won / Secured</span>
            <Trophy className="w-3 h-3 text-readflow-gold" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-readflow-green dark:text-readflow-lightgreen font-mono truncate">
            {formatMonetaryValue(monetarySummary.wonTotal, monetarySummary.currencySymbol)}
          </div>
          <span className="text-[9px] text-sepia-400 font-medium">
            {monetarySummary.wonCount} won
          </span>
        </div>

        <div className="bg-cream-50/60 dark:bg-sepia-850/40 p-2.5 rounded-xl border border-cream-200/80 dark:border-sepia-800/80">
          <div className="flex items-center justify-between text-sepia-450 dark:text-sepia-500 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Win Ratio</span>
            <TrendingUp className="w-3 h-3 text-readflow-olive" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-sepia-800 dark:text-cream-100 font-mono">
            {monetarySummary.winRate}%
          </div>
          <span className="text-[9px] text-sepia-400 font-medium">
            {monetarySummary.wonCount} won vs {monetarySummary.lostCount} lost
          </span>
        </div>

        <div className="bg-cream-50/60 dark:bg-sepia-850/40 p-2.5 rounded-xl border border-cream-200/80 dark:border-sepia-800/80">
          <div className="flex items-center justify-between text-sepia-450 dark:text-sepia-500 mb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Total Tracked</span>
            <GitBranch className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-sepia-800 dark:text-cream-100 font-mono">
            {pipelines.length}
          </div>
          <span className="text-[9px] text-sepia-400 font-medium">
            across {Object.keys(CATEGORY_PIPELINE_TEMPLATES).length} categories
          </span>
        </div>
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
                  {pipelineFieldConfig.entityLabel}
                </label>
                <input
                  id="new-pipe-company"
                  type="text"
                  value={newCompanyOrClient}
                  onChange={(e) => setNewCompanyOrClient(e.target.value)}
                  placeholder={pipelineFieldConfig.entityPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1">
                  {pipelineFieldConfig.valueLabel}
                </label>
                <input
                  id="new-pipe-expected-value"
                  type="text"
                  value={newExpectedValue}
                  onChange={(e) => setNewExpectedValue(e.target.value)}
                  placeholder={pipelineFieldConfig.valuePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sepia-450 dark:text-sepia-500 mb-1.5">
                Workflow Preset Structure (Category Standardized)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                {TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    id={`tmpl-btn-${idx}`}
                    onClick={() => setNewTemplateIdx(idx)}
                    className={`p-2 rounded-xl border text-center text-[10px] font-semibold transition-all cursor-pointer ${
                      newTemplateIdx === idx
                        ? 'bg-cream-100 dark:bg-sepia-850 border-readflow-green dark:border-readflow-lightgreen text-readflow-green dark:text-readflow-lightgreen border-2 font-bold shadow-xs'
                        : 'border-cream-150 dark:border-sepia-850 hover:border-cream-200 text-sepia-700 dark:text-cream-200'
                    }`}
                  >
                    <div className="truncate">{tmpl.name}</div>
                    <div className="text-[9px] opacity-60 font-normal mt-0.5">{tmpl.stages.length} stages</div>
                  </button>
                ))}
              </div>
              {newTemplateIdx >= 0 && TEMPLATES[newTemplateIdx] && (
                <div className="mt-2 text-[10px] text-sepia-500 dark:text-cream-300 flex items-center flex-wrap gap-1 p-2 rounded-xl bg-cream-50/50 dark:bg-sepia-850/40 border border-cream-200/50 dark:border-sepia-800/50">
                  <span className="font-semibold text-sepia-700 dark:text-cream-200">Stages:</span>
                  {TEMPLATES[newTemplateIdx].stages.map((stg, i, arr) => (
                    <span key={stg} className="inline-flex items-center">
                      <span className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-850 font-mono text-[9px] text-sepia-700 dark:text-cream-200">{stg}</span>
                      {i < arr.length - 1 && <span className="mx-1 text-sepia-300">→</span>}
                    </span>
                  ))}
                </div>
              )}
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-none font-sans"
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
      ) : viewMode === 'kanban' ? (
        /* ========================================================================= */
        /* KANBAN BOARD VIEW */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col gap-3">
          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-sepia-450 dark:text-sepia-500 uppercase tracking-wider font-mono mr-1">
              Category:
            </span>
            {['All', ...Object.keys(CATEGORY_PIPELINE_TEMPLATES)].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setKanbanCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  kanbanCategory === cat
                    ? 'bg-readflow-green text-cream-50 shadow-xs'
                    : 'bg-cream-100 dark:bg-sepia-850 text-sepia-650 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-sepia-800'
                }`}
              >
                {cat}
                <span className="ml-1 opacity-70 font-mono">
                  ({cat === 'All' ? pipelines.length : pipelines.filter((p) => p.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          {/* Kanban Columns Horizontal Scrolling Board */}
          <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex items-start gap-3 min-w-max">
              {kanbanColumns.map((colName) => {
                const colPipes = filteredPipelines.filter((p) => doesPipelineMatchColumn(p, colName));
                const isOver = dragOverColumn === colName;
                const isWonCol = colName.includes('Won') || colName.includes('Awarded') || colName.includes('Paid') || colName.includes('Completed');
                const isLostCol = colName.includes('Lost') || colName.includes('Not Selected') || colName.includes('Dropped');

                const colTotal = colPipes.reduce((sum, p) => sum + parseMonetaryValue(p.expectedValue).amount, 0);

                return (
                  <div
                    key={colName}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverColumn(colName);
                    }}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDropOnColumn(e, colName)}
                    className={`w-64 flex flex-col rounded-xl border p-2.5 min-h-[380px] max-h-[600px] transition-all ${
                      isOver
                        ? 'border-readflow-green bg-cream-100/70 dark:bg-sepia-800/50 scale-[1.01]'
                        : isWonCol
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                        : isLostCol
                        ? 'bg-rose-50/25 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-900/40'
                        : 'bg-cream-50/50 dark:bg-sepia-850/30 border-cream-200/80 dark:border-sepia-800/80'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-cream-200/60 dark:border-sepia-800/60 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-bold text-xs truncate ${
                          isWonCol ? 'text-readflow-green dark:text-readflow-lightgreen' : isLostCol ? 'text-rose-500' : 'text-sepia-800 dark:text-cream-100'
                        }`}>
                          {colName}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-white dark:bg-sepia-900 px-1.5 py-0.2 rounded text-sepia-500 dark:text-cream-300">
                          {colPipes.length}
                        </span>
                      </div>
                      {colTotal > 0 && (
                        <span className="text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate ml-1">
                          {formatMonetaryValue(colTotal, monetarySummary.currencySymbol)}
                        </span>
                      )}
                    </div>

                    {/* Cards List in this Column */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
                      {colPipes.length === 0 ? (
                        <div className="h-24 flex items-center justify-center text-[11px] text-sepia-350 dark:text-sepia-600 italic">
                          Drop deals here
                        </div>
                      ) : (
                        colPipes.map((p) => {
                          const isSelected = p.id === currentSelectedId;
                          const allTasks = p.stages.flatMap((s) => s.checklist || []);
                          const doneTasks = allTasks.filter((t) => t.isCompleted).length;

                          return (
                            <div
                              key={p.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/pipeline-id', p.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => {
                                updateSelectedId(p.id);
                              }}
                              className={`p-3 rounded-xl border bg-white dark:bg-sepia-900 transition-all cursor-grab active:cursor-grabbing hover:shadow-md ${
                                isSelected
                                  ? 'border-readflow-green dark:border-readflow-lightgreen ring-1 ring-readflow-green shadow-xs'
                                  : 'border-cream-200 dark:border-sepia-800 hover:border-cream-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <span className="text-xs font-bold text-sepia-850 dark:text-cream-100 line-clamp-2 leading-snug">
                                  {p.title}
                                </span>
                                {p.linkedOpportunityId && (
                                  <span className="text-readflow-green shrink-0" title="Linked to Opportunity Log">
                                    <Link className="w-3 h-3" />
                                  </span>
                                )}
                              </div>

                              {p.companyOrClient && (
                                <div className="flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 font-medium truncate mb-1">
                                  <Building className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{p.companyOrClient}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-cream-150/60 dark:border-sepia-800/60 text-[9px]">
                                {p.expectedValue ? (
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                    {p.expectedValue}
                                  </span>
                                ) : (
                                  <span className="text-sepia-400 font-sans">{p.type}</span>
                                )}

                                {allTasks.length > 0 && (
                                  <span className="text-sepia-500 font-mono font-semibold">
                                    {doneTasks}/{allTasks.length} tasks
                                  </span>
                                )}
                              </div>

                              {/* Card quick stage step controls */}
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-cream-100 dark:border-sepia-800/50">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStepBack(p);
                                  }}
                                  disabled={p.currentStageIndex === 0}
                                  className="p-1 rounded text-sepia-400 hover:text-sepia-700 hover:bg-cream-100 dark:hover:bg-sepia-800 disabled:opacity-20 cursor-pointer"
                                  title="Move to previous stage"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                
                                <span className="text-[9px] font-bold text-sepia-450 dark:text-sepia-500 font-mono">
                                  {p.status === 'won' ? '🎉 Won' : p.status === 'lost' ? 'Lost' : `${p.currentStageIndex + 1}/${p.stages.length}`}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAdvanceStage(p);
                                  }}
                                  disabled={p.currentStageIndex >= p.stages.length - 1}
                                  className="p-1 rounded text-sepia-400 hover:text-readflow-green hover:bg-cream-100 dark:hover:bg-sepia-800 disabled:opacity-20 cursor-pointer"
                                  title="Advance to next stage"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* LIST / STEPPER DETAIL VIEW */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-[300px]">
          {/* Pipelines select list */}
          <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-cream-150 dark:border-sepia-850 pb-3 sm:pb-0 sm:pr-3 flex flex-row sm:flex-col gap-1.5 sm:space-y-1.5 overflow-x-auto sm:overflow-y-auto max-h-[140px] sm:max-h-[420px] shrink-0">
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
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-sepia-800 dark:text-cream-100 truncate font-bold block w-full">
                          {pipe.title}
                        </span>
                        {pipe.linkedOpportunityId && (
                          <Link className="w-3 h-3 text-readflow-green shrink-0" title="Linked to Opportunity" />
                        )}
                      </div>
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

                      {/* Linked Opportunity section */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                        {selectedPipeline.linkedOpportunityId && linkedOpportunity ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-100 dark:bg-sepia-800 text-sepia-800 dark:text-cream-200 border border-cream-200 dark:border-sepia-700">
                            <Link className="w-3.5 h-3.5 text-readflow-green shrink-0" />
                            <span className="text-[11px] font-semibold">Linked Opportunity:</span>
                            <span className="font-bold text-[11px] text-readflow-green dark:text-readflow-lightgreen truncate max-w-[200px]">
                              {linkedOpportunity.title}
                            </span>
                            {onUpdateOpportunity && (
                              <button
                                type="button"
                                onClick={() => handleUnlinkOpportunity(selectedPipeline)}
                                className="ml-1 text-[10px] text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer"
                                title="Unlink from opportunity"
                              >
                                Unlink
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-sepia-400 italic">No linked logbook opportunity.</span>
                            {opportunities && opportunities.length > 0 && onUpdateOpportunity && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) handleLinkOpportunity(selectedPipeline, e.target.value);
                                }}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-readflow-gold/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 cursor-pointer focus:outline-none"
                              >
                                <option value="">+ Link to Opportunity...</option>
                                {opportunities
                                  .filter((o) => !o.pipelineId || o.pipelineId === selectedPipeline.id)
                                  .map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.title} ({o.category})
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
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
                                  {!isCurrent && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetCurrentStage(selectedPipeline, idx);
                                      }}
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cream-100 hover:bg-cream-200 dark:bg-sepia-800 dark:hover:bg-sepia-750 text-sepia-650 dark:text-cream-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mr-1"
                                      title="Set as current active stage"
                                    >
                                      Set Active
                                    </button>
                                  )}
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
                          className="px-3 py-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 text-readflow-olive dark:text-readflow-lightgreen hover:bg-cream-50 dark:hover:bg-sepia-850/40 transition-all font-bold flex items-center gap-1 cursor-pointer"
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
