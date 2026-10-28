import React, { useState, useRef } from 'react';
import { Opportunity, OpportunityPipeline, Vision, ChecklistHabit, isChecklistOpportunity, textToChecklistItems } from '../types';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  FileUp,
  Download,
  GitBranch,
  FileText,
  Plus,
  HelpCircle,
  TrendingUp,
  Award,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Building,
  Coins,
  CheckSquare,
  ListChecks,
  Calendar,
  GraduationCap,
  Tag
} from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';
import { getCategoryFieldConfig } from '../utils/categoryFields';
import { FormattedText } from './FormattedText';

interface OpportunitiesLogbookProps {
  opportunities: Opportunity[];
  pipelines: OpportunityPipeline[];
  visions: Vision[];
  checklistHabits?: ChecklistHabit[];
  onUpdateOpportunity: (updatedOpp: Opportunity) => void;
  onDeleteOpportunity: (id: string) => void;
  onAddPipeline: (newPipe: Omit<OpportunityPipeline, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigateToDashboard: () => void;
  onSelectPipeline: (id: string) => void;
}

const STAGES = [
  'Sourced',
  'Applied',
  'Contacted',
  'Interviewing',
  'Offer',
  'Won 🎉',
  'Lost',
  'Completed',
  'Active'
];

export const OpportunitiesLogbook: React.FC<OpportunitiesLogbookProps> = ({
  opportunities,
  pipelines,
  visions,
  checklistHabits,
  onUpdateOpportunity,
  onDeleteOpportunity,
  onAddPipeline,
  onNavigateToDashboard,
  onSelectPipeline,
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'points-desc' | 'title-asc' | 'deadline-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('');
  const [editCompanyOrClient, setEditCompanyOrClient] = useState('');
  const [editExpectedValue, setEditExpectedValue] = useState('');
  const [editPoints, setEditPoints] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLinkedVisionId, setEditLinkedVisionId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEligibility, setEditEligibility] = useState('');
  const [editRequirements, setEditRequirements] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // Inline row tag adding state
  const [activeAddTagOppId, setActiveAddTagOppId] = useState<string | null>(null);
  const [inlineTagInput, setInlineTagInput] = useState<string>('');

  // Drag and drop / upload refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  // Exclude checklist habits from Opportunities Logbook
  const logbookOpportunities = React.useMemo(() => {
    return opportunities.filter((opp) => !isChecklistOpportunity(opp, checklistHabits));
  }, [opportunities, checklistHabits]);

  // Tag extraction and counting
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>(['#remote', '#inbound', '#high-priority', '#grant', '#referral', '#urgent', '#freelance', '#fellowship']);
    logbookOpportunities.forEach((opp) => {
      (opp.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [logbookOpportunities]);

  const tagCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    logbookOpportunities.forEach((opp) => {
      (opp.tags || []).forEach((t) => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return map;
  }, [logbookOpportunities]);

  const handleToggleFilterTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const handleAddTagToOpp = (opp: Opportunity, tagToAdd: string) => {
    const clean = tagToAdd.trim().startsWith('#') ? tagToAdd.trim() : `#${tagToAdd.trim()}`;
    if (!clean || clean === '#') return;
    const existing = opp.tags || [];
    if (existing.includes(clean)) return;
    onUpdateOpportunity({
      ...opp,
      tags: [...existing, clean],
    });
    setActiveAddTagOppId(null);
    setInlineTagInput('');
  };

  const handleRemoveTagFromOpp = (opp: Opportunity, tagToRemove: string) => {
    const existing = opp.tags || [];
    onUpdateOpportunity({
      ...opp,
      tags: existing.filter((t) => t !== tagToRemove),
    });
  };

  // Helper to download an .ics file for calendar clients
  const downloadICalEvent = (opp: Opportunity, dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    const startStr = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//1000 Opportunities Challenge//Logbook//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:opp-${opp.id}-${Date.now()}@opportunities.challenge`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Deadline: ${opp.title.replace(/[,;]/g, ' ')}`,
      `DESCRIPTION:${(opp.description || opp.title + ' Application Deadline').replace(/[\r\n]/g, '\\n')}`,
      opp.companyOrClient ? `LOCATION:${opp.companyOrClient.replace(/[,;]/g, ' ')}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${opp.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-deadline.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to generate Google Calendar template link
  const getGoogleCalendarUrl = (opp: Opportunity, dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '#';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateParam = `${y}${m}${d}`;

    const text = encodeURIComponent(`Deadline: ${opp.title}`);
    const details = encodeURIComponent(
      `1000 Opportunities Challenge - Application Deadline\nTarget: ${opp.companyOrClient || 'N/A'}\nAward / Value: ${opp.expectedValue || 'N/A'}\n\nNotes:\n${opp.description || ''}`
    );
    const location = encodeURIComponent(opp.companyOrClient || '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dateParam}/${dateParam}&details=${details}&location=${location}`;
  };

  // Helper for deadline countdown text
  const getDeadlineCountdown = (dateStr: string): { text: string; urgent: boolean; past: boolean } => {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return { text: dateStr, urgent: false, past: false };
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetMidnight = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    const diffDays = Math.round((targetMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, urgent: false, past: true };
    if (diffDays === 0) return { text: 'Due today!', urgent: true, past: false };
    if (diffDays === 1) return { text: 'Due tomorrow', urgent: true, past: false };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: true, past: false };
    return { text: `in ${diffDays} days`, urgent: false, past: false };
  };

  // Statistics
  const totalPoints = logbookOpportunities.reduce((sum, o) => sum + o.points, 0);
  const totalFiles = logbookOpportunities.filter((o) => o.fileName).length;
  const activePipelineLinks = logbookOpportunities.filter((o) => o.pipelineId).length;

  // Filtered and sorted opportunities
  const filteredOpps = logbookOpportunities.filter((opp) => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (opp.companyOrClient && opp.companyOrClient.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (opp.expectedValue && opp.expectedValue.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (opp.type && opp.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (opp.description && opp.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;

    const currentOppStage = opp.stage || 'Sourced';
    const matchesStage = selectedStage === 'All' || currentOppStage === selectedStage;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((st) => (opp.tags || []).includes(st));

    return matchesSearch && matchesCategory && matchesStage && matchesTags;
  });

  const sortedOpps = [...filteredOpps].sort((a, b) => {
    if (sortBy === 'deadline-asc') {
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'date-desc') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (sortBy === 'points-desc') {
      return b.points - a.points;
    }
    if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOpps.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOpps = sortedOpps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper to change page safely
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export Opportunities progress to a local CSV backup file
  const exportToCSV = () => {
    const headers = [
      'Title',
      'Target Company/Client',
      'Expected Salary/Grant/Value',
      'Category',
      'Subtype/Tag',
      'Score Points',
      'Stage Status',
      'Qualitative Notes/Feedback',
      'Logged Date',
      'Linked Vision/Goal ID'
    ];
    const rows = logbookOpportunities.map((opp) => [
      `"${opp.title.replace(/"/g, '""')}"`,
      `"${(opp.companyOrClient || '').replace(/"/g, '""')}"`,
      `"${(opp.expectedValue || '').replace(/"/g, '""')}"`,
      `"${opp.category}"`,
      `"${(opp.type || '').replace(/"/g, '""')}"`,
      opp.points,
      `"${(opp.stage || 'Sourced').replace(/"/g, '""')}"`,
      `"${(opp.feedback || opp.description || '').replace(/"/g, '""')}"`,
      `"${new Date(opp.timestamp).toLocaleDateString()}"`,
      `"${opp.linkedVisionId || ''}"`
    ]);
    
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `opportunities_backup_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Start Inline Editing
  const startEditing = (opp: Opportunity) => {
    setEditingId(opp.id);
    setEditTitle(opp.title);
    setEditCategory(opp.category);
    setEditType(opp.type);
    setEditCompanyOrClient(opp.companyOrClient || '');
    setEditExpectedValue(opp.expectedValue || '');
    setEditPoints(opp.points);
    setEditFeedback(opp.feedback || '');
    setEditStage(opp.stage || 'Sourced');
    setEditDate(opp.timestamp.substring(0, 10));
    setEditLinkedVisionId(opp.linkedVisionId || '');
    setEditDescription(opp.description || '');
    setEditEligibility(
      opp.eligibility ||
      (opp.eligibilityChecklist ? opp.eligibilityChecklist.map((i) => i.text).join('\n') : '')
    );
    setEditRequirements(
      opp.requirements ||
      (opp.requirementsChecklist ? opp.requirementsChecklist.map((i) => i.text).join('\n') : '')
    );
    setEditDeadline(opp.deadline || '');
    setEditTags(opp.tags ? [...opp.tags] : []);
    setNewTagInput('');
  };

  // Save Inline Edits
  const saveEdits = (opp: Opportunity) => {
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    const timePart = opp.timestamp.includes('T') ? opp.timestamp.split('T')[1] : '12:00:00.000Z';
    const newTimestamp = editDate ? `${editDate}T${timePart}` : opp.timestamp;

    const isScholarship = editCategory === 'Scholarships';
    const eligibilityChecklist = isScholarship && editEligibility.trim()
      ? textToChecklistItems(editEligibility)
      : isScholarship ? opp.eligibilityChecklist : undefined;
    const requirementsChecklist = isScholarship && editRequirements.trim()
      ? textToChecklistItems(editRequirements)
      : isScholarship ? opp.requirementsChecklist : undefined;

    onUpdateOpportunity({
      ...opp,
      title: editTitle.trim(),
      category: editCategory,
      type: editType.trim(),
      companyOrClient: editCompanyOrClient.trim() || undefined,
      expectedValue: editExpectedValue.trim() || undefined,
      points: editPoints,
      feedback: editFeedback.trim(),
      stage: editStage,
      timestamp: newTimestamp,
      linkedVisionId: editLinkedVisionId || undefined,
      description: editDescription.trim() || undefined,
      eligibility: isScholarship ? editEligibility.trim() || undefined : opp.eligibility,
      requirements: isScholarship ? editRequirements.trim() || undefined : opp.requirements,
      deadline: isScholarship ? editDeadline.trim() || undefined : opp.deadline,
      eligibilityChecklist,
      requirementsChecklist,
      tags: editTags.length > 0 ? editTags : undefined,
    });
    setEditingId(null);
  };

  // Toggle Scholarship checklist items
  const handleToggleEligibilityItem = (opp: Opportunity, itemId: string) => {
    const currentList = opp.eligibilityChecklist && opp.eligibilityChecklist.length > 0
      ? opp.eligibilityChecklist
      : textToChecklistItems(opp.eligibility);
    const updatedList = currentList.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateOpportunity({
      ...opp,
      eligibilityChecklist: updatedList,
    });
  };

  const handleToggleRequirementItem = (opp: Opportunity, itemId: string) => {
    const currentList = opp.requirementsChecklist && opp.requirementsChecklist.length > 0
      ? opp.requirementsChecklist
      : textToChecklistItems(opp.requirements);
    const updatedList = currentList.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateOpportunity({
      ...opp,
      requirementsChecklist: updatedList,
    });
  };

  // Quick feedback save (blur or enter key)
  const handleQuickFeedbackSave = (opp: Opportunity, newFeedback: string) => {
    onUpdateOpportunity({
      ...opp,
      feedback: newFeedback,
    });
  };

  // Quick stage save
  const handleQuickStageSave = (opp: Opportunity, newStage: string) => {
    onUpdateOpportunity({
      ...opp,
      stage: newStage,
    });
  };

  // Handle File Upload and converting to Base64
  const handleFileUpload = (opp: Opportunity, file: File) => {
    if (file.size > 1.2 * 1024 * 1024) {
      alert('For offline reliability, file sizes are limited to 1.2MB. Please upload a smaller PDF/image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateOpportunity({
        ...opp,
        fileName: file.name,
        fileData: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (opp: Opportunity, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(opp, files[0]);
    }
  };

  // Trigger download of stored file
  const triggerDownload = (opp: Opportunity) => {
    if (!opp.fileData || !opp.fileName) return;
    const link = document.createElement('a');
    link.href = opp.fileData;
    link.download = opp.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove File Attachment
  const handleRemoveFile = (opp: Opportunity) => {
    onUpdateOpportunity({
      ...opp,
      fileName: undefined,
      fileData: undefined,
    });
  };

  // Open or Create Pipeline
  const handlePipelineAction = (opp: Opportunity) => {
    if (opp.pipelineId) {
      // Find and select it
      onSelectPipeline(opp.pipelineId);
      onNavigateToDashboard();
      
      // Scroll pipeline section into view
      setTimeout(() => {
        const el = document.getElementById('pipeline-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      // Create a brand-new pipeline for this opportunity
      const presetStages = [
        { name: 'Lead Sourced', completedAt: new Date().toISOString() },
        { name: 'Application Prepared' },
        { name: 'First Correspondence' },
        { name: 'Interview Loop' },
        { name: 'Offer Secured' }
      ];

      const newPipelineId = `pipe-${Date.now()}`;
      
      const newPipeline: OpportunityPipeline = {
        id: newPipelineId,
        title: `${opp.title} (${opp.type || 'Opportunity'})`,
        type: opp.category === 'Career' ? 'Job' : opp.category === 'Finance' ? 'Scholarship' : 'Custom',
        companyOrClient: opp.companyOrClient,
        expectedValue: opp.expectedValue,
        stages: presetStages,
        currentStageIndex: 0,
        status: 'active',
        notes: `Automatically generated tracker connected to opportunity logged on ${new Date(opp.timestamp).toLocaleDateString()}.${opp.companyOrClient ? `\nTarget: ${opp.companyOrClient}` : ''}${opp.expectedValue ? `\nExpected Value: ${opp.expectedValue}` : ''}${opp.description ? `\n\nJob Description / Enquiry:\n${opp.description}` : ''}\n\nFeedback Log: ${opp.feedback || 'None yet'}`,
        category: opp.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Call state change
      onAddPipeline(newPipeline);
      
      // Update opportunity link
      onUpdateOpportunity({
        ...opp,
        pipelineId: newPipelineId,
        stage: 'Active'
      });

      // Select it and go
      onSelectPipeline(newPipelineId);
      onNavigateToDashboard();

      setTimeout(() => {
        const el = document.getElementById('pipeline-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Drag-and-drop helpers
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragActiveId(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActiveId(null);
  };

  const handleDrop = (e: React.DragEvent, opp: Opportunity) => {
    e.preventDefault();
    setDragActiveId(null);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(opp, files[0]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Upper KPIs Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cream-50 dark:bg-sepia-800 flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500">Total Opportunities</span>
            <h4 className="text-xl font-bold font-mono text-sepia-900 dark:text-cream-100">{opportunities.length}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cream-50 dark:bg-sepia-800 flex items-center justify-center text-readflow-gold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500">Combined Quality Score</span>
            <h4 className="text-xl font-bold font-mono text-sepia-900 dark:text-cream-100">{totalPoints} pts</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cream-50 dark:bg-sepia-800 flex items-center justify-center text-readflow-olive">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500">Stored Attachments</span>
            <h4 className="text-xl font-bold font-mono text-sepia-900 dark:text-cream-100">{totalFiles} files</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cream-50 dark:bg-sepia-800 flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-sepia-400 dark:text-sepia-500">Pipeline Integrations</span>
            <h4 className="text-xl font-bold font-mono text-sepia-900 dark:text-cream-100">{activePipelineLinks} active</h4>
          </div>
        </div>
      </div>

      {/* Advanced Filtering & Controls Panel */}
      <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-readflow-gold" />
              Opportunities Logbook & Auditor
            </h2>
            <p className="text-xs text-sepia-400 dark:text-sepia-500 mt-0.5">
              Refined inspection of all documented attempts, feedback comments, active pipeline connections, and files.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="export-csv-btn"
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-readflow-green dark:bg-readflow-olive text-cream-50 hover:bg-readflow-green/95 dark:hover:bg-readflow-olive/95 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
              title="Export all opportunities to CSV backup"
            >
              <Download className="w-3.5 h-3.5" />
              Backup CSV
            </button>
            <button
              id="back-to-dashboard-btn"
              onClick={onNavigateToDashboard}
              className="flex items-center gap-1.5 px-4 py-2 bg-cream-100 hover:bg-cream-150 dark:bg-sepia-800 dark:hover:bg-sepia-750 text-sepia-800 dark:text-cream-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              ← View Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-sepia-400 absolute left-3 top-3" />
            <input
              id="logbook-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search title or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/20 dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="logbook-category-filter"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/20 dark:bg-sepia-900 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              <option value="All">All Categories</option>
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div>
            <select
              id="logbook-stage-filter"
              value={selectedStage}
              onChange={(e) => { setSelectedStage(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/20 dark:bg-sepia-900 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              <option value="All">All Stages</option>
              {STAGES.map((stg) => (
                <option key={stg} value={stg}>{stg}</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <select
              id="logbook-sort-by"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/20 dark:bg-sepia-900 text-sepia-700 dark:text-cream-200 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
            >
              <option value="deadline-asc">Approaching Deadline (Closest First)</option>
              <option value="date-desc">Newest Attempt First</option>
              <option value="date-asc">Oldest Attempt First</option>
              <option value="points-desc">Highest Quality points</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Multi-Tagging Filter Pill Bar */}
        <div className="pt-2.5 border-t border-cream-150 dark:border-sepia-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-sepia-400 dark:text-sepia-500 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-readflow-gold" />
              Tags:
            </span>

            {/* All Tags pill */}
            <button
              type="button"
              id="filter-tag-all"
              onClick={() => { setSelectedTags([]); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedTags.length === 0
                  ? 'bg-readflow-green text-cream-50 shadow-xs'
                  : 'bg-cream-100 dark:bg-sepia-850 text-sepia-650 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-sepia-800 border border-cream-200 dark:border-sepia-750'
              }`}
            >
              All Tags ({logbookOpportunities.length})
            </button>

            {/* Individual Tag Chips */}
            {availableTags.map((tag) => {
              const count = tagCounts[tag] || 0;
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  id={`filter-tag-${tag.replace('#', '')}`}
                  onClick={() => handleToggleFilterTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-readflow-green text-cream-50 font-bold shadow-xs'
                      : 'bg-cream-100 dark:bg-sepia-850 text-sepia-650 dark:text-cream-300 hover:bg-cream-200 dark:hover:bg-sepia-800 border border-cream-200 dark:border-sepia-750'
                  }`}
                >
                  <span>{tag}</span>
                  <span className={`px-1 py-0.2 rounded-full text-[9px] ${
                    isSelected ? 'bg-black/20 text-cream-50' : 'bg-cream-200/80 dark:bg-sepia-800 text-sepia-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedTags.length > 0 && (
            <button
              type="button"
              id="clear-tags-filter-btn"
              onClick={() => { setSelectedTags([]); setCurrentPage(1); }}
              className="text-[10px] font-mono font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Clear Tags Filter ({selectedTags.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Table Logbook Card */}
      <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream-50/60 dark:bg-sepia-900 border-b border-cream-150 dark:border-sepia-800 text-sepia-400 font-bold uppercase tracking-wider font-mono">
                <th className="p-4">Opportunity details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Score</th>
                <th className="p-4 w-44">Stage Status</th>
                <th className="p-4 min-w-[180px]">Feedback / Qualitative Notes</th>
                <th className="p-4 min-w-[160px]">File Attachment</th>
                <th className="p-4 text-center">Pipeline</th>
                <th className="p-4 text-center">Edit / Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 dark:divide-sepia-800">
              {paginatedOpps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-sepia-400 italic">
                    <HelpCircle className="w-8 h-8 mx-auto text-cream-300 dark:text-sepia-800 mb-2" />
                    No logged opportunities match the current filter selection. Keep creating!
                  </td>
                </tr>
              ) : (
                paginatedOpps.map((opp) => {
                  const isEditing = editingId === opp.id;
                        const editFieldConfig = isEditing ? getCategoryFieldConfig(editCategory) : null;
                  const meta = CATEGORY_METADATA[opp.category] || CATEGORY_METADATA.Career;
                  const Icon = meta.icon;

                  if (isEditing) {
                    return (
                      <tr key={opp.id} className="bg-cream-50/70 dark:bg-sepia-800/15 border-l-4 border-readflow-green">
                        {/* Title and details inputs */}
                        <td className="p-3 space-y-2">
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Action title</label>
                            <input
                              id={`page-edit-title-${opp.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">{editFieldConfig?.entityLabel.replace(' (Optional)', '') || 'Target Entity'}</label>
                            <input
                              id={`page-edit-company-${opp.id}`}
                              type="text"
                              value={editCompanyOrClient}
                              onChange={(e) => setEditCompanyOrClient(e.target.value)}
                              placeholder={editFieldConfig?.entityPlaceholder || 'Target Entity'}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">{editFieldConfig?.valueLabel.replace(' (Optional)', '') || 'Expected Value'}</label>
                            <input
                              id={`page-edit-expected-value-${opp.id}`}
                              type="text"
                              value={editExpectedValue}
                              onChange={(e) => setEditExpectedValue(e.target.value)}
                              placeholder={editFieldConfig?.valuePlaceholder || 'Expected Value'}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Subtype / Tag</label>
                            <input
                              id={`page-edit-type-${opp.id}`}
                              type="text"
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                            />
                          </div>
                          {editCategory === 'Scholarships' ? (
                            <div className="space-y-2 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40">
                              <div className="text-[10px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                Scholarship Criteria & Checklists
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Eligibility Criteria (Checklist - 1 per line)</label>
                                <textarea
                                  id={`page-edit-eligibility-${opp.id}`}
                                  value={editEligibility}
                                  onChange={(e) => setEditEligibility(e.target.value)}
                                  placeholder="e.g. Min 3.5 GPA&#10;Under 30 years old"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Application Requirements (Checklist - 1 per line)</label>
                                <textarea
                                  id={`page-edit-requirements-${opp.id}`}
                                  value={editRequirements}
                                  onChange={(e) => setEditRequirements(e.target.value)}
                                  placeholder="e.g. Transcripts&#10;SOP&#10;2 Recommendation Letters"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Application Deadline</label>
                                <input
                                  id={`page-edit-deadline-${opp.id}`}
                                  type="text"
                                  value={editDeadline}
                                  onChange={(e) => setEditDeadline(e.target.value)}
                                  placeholder="e.g. Nov 15, 2026 or 2026-11-15"
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Additional Notes / Essay Prompts</label>
                                <textarea
                                  id={`page-edit-description-${opp.id}`}
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Essay prompts, application link, notes..."
                                  className="w-full px-2.5 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">{editFieldConfig?.detailsLabel.replace(' (Optional)', '') || 'Details & Notes'}</label>
                              <textarea
                                id={`page-edit-description-${opp.id}`}
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder={editFieldConfig?.detailsPlaceholder || 'Details & Notes'}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans"
                                rows={2}
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Linked Vision / Goal</label>
                            <select
                              id={`page-edit-vision-${opp.id}`}
                              value={editLinkedVisionId}
                              onChange={(e) => setEditLinkedVisionId(e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer"
                            >
                              <option value="">-- None --</option>
                              {visions.map((v) => (
                                <option key={v.id} value={v.id}>{v.title}</option>
                              ))}
                            </select>
                          </div>

                          {/* Edit Mode Tags */}
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-sepia-400 uppercase">Tags & Labels</label>
                            <div className="flex flex-wrap gap-1 mb-1 mt-0.5">
                              {editTags.map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cream-150 dark:bg-sepia-800 text-sepia-800 dark:text-cream-200 border border-cream-200 dark:border-sepia-700"
                                >
                                  {t}
                                  <button
                                    type="button"
                                    onClick={() => setEditTags(editTags.filter((x) => x !== t))}
                                    className="text-sepia-400 hover:text-rose-500 font-bold ml-0.5 cursor-pointer"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const clean = newTagInput.trim().startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
                                    if (clean && clean !== '#' && !editTags.includes(clean)) {
                                      setEditTags([...editTags, clean]);
                                    }
                                    setNewTagInput('');
                                  }
                                }}
                                placeholder="Add tag (e.g. #remote)..."
                                className="flex-1 px-2 py-1 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const clean = newTagInput.trim().startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
                                  if (clean && clean !== '#' && !editTags.includes(clean)) {
                                    setEditTags([...editTags, clean]);
                                  }
                                  setNewTagInput('');
                                }}
                                className="px-2 py-1 text-xs font-bold rounded bg-cream-200 dark:bg-sepia-800 text-sepia-800 dark:text-cream-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Category selection */}
                        <td className="p-3">
                          <select
                            id={`page-edit-cat-${opp.id}`}
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-bold"
                          >
                            {Object.keys(CATEGORY_METADATA).map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>

                        {/* Point slider or number */}
                        <td className="p-3 w-20">
                          <input
                            id={`page-edit-pts-${opp.id}`}
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs text-right font-mono font-bold rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                          />
                        </td>

                        {/* Stage Dropdown */}
                        <td className="p-3">
                          <select
                            id={`page-edit-stage-${opp.id}`}
                            value={editStage}
                            onChange={(e) => setEditStage(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-bold"
                          >
                            {STAGES.map((stg) => (
                              <option key={stg} value={stg}>{stg}</option>
                            ))}
                          </select>
                        </td>

                        {/* Feedback text area */}
                        <td className="p-3">
                          <textarea
                            id={`page-edit-feedback-${opp.id}`}
                            value={editFeedback}
                            onChange={(e) => setEditFeedback(e.target.value)}
                            rows={2}
                            placeholder="Add qualitative feedback notes..."
                            className="w-full p-2 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-none font-sans"
                          />
                        </td>

                        {/* Editable Date */}
                        <td className="p-3">
                          <input
                            id={`page-edit-date-${opp.id}`}
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
                          />
                        </td>

                        <td className="p-3 text-center">-</td>

                        {/* Edit Action controls */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`page-save-btn-${opp.id}`}
                              onClick={() => saveEdits(opp)}
                              className="text-cream-50 bg-readflow-green hover:bg-readflow-olive p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`page-cancel-btn-${opp.id}`}
                              onClick={() => setEditingId(null)}
                              className="text-sepia-500 bg-cream-100 hover:bg-cream-250 dark:bg-sepia-800 dark:hover:bg-sepia-750 p-1.5 rounded-lg transition-all cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const oppStage = opp.stage || 'Sourced';

                  return (
                    <tr
                      key={opp.id}
                      className="hover:bg-cream-50/45 dark:hover:bg-sepia-800/10 transition-colors"
                    >
                      {/* Details Column */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-sepia-850 dark:text-cream-50 text-sm leading-snug">
                          {opp.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-sepia-450 dark:text-sepia-500 font-medium font-sans">
                          <span className="font-mono bg-cream-100 dark:bg-sepia-850 px-1.5 py-0.5 rounded text-sepia-700 dark:text-cream-200 border border-cream-200/50 dark:border-sepia-800">
                            {opp.type || 'generic'}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{new Date(opp.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          {opp.linkedVisionId && (
                            <>
                              <span>•</span>
                              <span className="text-readflow-green dark:text-readflow-lightgreen font-bold flex items-center gap-1 font-sans">
                                <TrendingUp className="w-3 h-3 text-readflow-green/80" />
                                Goal: {visions.find((v) => v.id === opp.linkedVisionId)?.title || 'Linked Goal'}
                              </span>
                            </>
                          )}
                        </div>

                        {opp.companyOrClient && (
                          <div className="mt-1.5 text-xs text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1.5 font-sans">
                            <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{opp.companyOrClient}</span>
                          </div>
                        )}

                        {opp.expectedValue && (
                          <div className="mt-1 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5 font-sans">
                            <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{opp.expectedValue}</span>
                          </div>
                        )}

                        {/* Opportunity Tags & Inline Quick-Add */}
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          {(opp.tags || []).map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cream-150 dark:bg-sepia-800 text-sepia-750 dark:text-cream-200 border border-cream-200 dark:border-sepia-700"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTagFromOpp(opp, t);
                                }}
                                className="text-sepia-400 hover:text-rose-500 ml-0.5 cursor-pointer font-bold leading-none"
                                title={`Remove tag ${t}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}

                          {activeAddTagOppId === opp.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAddTagToOpp(opp, inlineTagInput);
                              }}
                              className="inline-flex items-center gap-0.5"
                            >
                              <input
                                type="text"
                                value={inlineTagInput}
                                onChange={(e) => setInlineTagInput(e.target.value)}
                                placeholder="#tag"
                                autoFocus
                                onBlur={() => {
                                  if (!inlineTagInput.trim()) setActiveAddTagOppId(null);
                                }}
                                className="w-16 px-1.5 py-0.5 text-[9px] font-mono rounded border border-readflow-green bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-1 py-0.5 text-[9px] font-bold bg-readflow-green text-cream-50 rounded"
                              >
                                ✓
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAddTagOppId(opp.id);
                                setInlineTagInput('');
                              }}
                              className="text-[9px] font-mono text-sepia-400 hover:text-readflow-green dark:hover:text-readflow-lightgreen px-1.5 py-0.5 rounded border border-dashed border-cream-250 dark:border-sepia-750 cursor-pointer flex items-center gap-0.5"
                              title="Add tag to opportunity"
                            >
                              <Plus className="w-2.5 h-2.5" /> tag
                            </button>
                          )}
                        </div>

                        {/* SCHOLARSHIP SECTION: Eligibility Checklist, Requirements Checklist & Deadline */}
                        {opp.category === 'Scholarships' && (() => {
                          const eligibilityItems = opp.eligibilityChecklist && opp.eligibilityChecklist.length > 0
                            ? opp.eligibilityChecklist
                            : opp.eligibility
                            ? textToChecklistItems(opp.eligibility)
                            : [];
                          const requirementsItems = opp.requirementsChecklist && opp.requirementsChecklist.length > 0
                            ? opp.requirementsChecklist
                            : opp.requirements
                            ? textToChecklistItems(opp.requirements)
                            : [];

                          return (
                            <div className="mt-3 space-y-2.5">
                              {opp.deadline && (() => {
                                const countdown = getDeadlineCountdown(opp.deadline);
                                const gCalUrl = getGoogleCalendarUrl(opp, opp.deadline);
                                return (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                      countdown.past
                                        ? 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800'
                                        : countdown.urgent
                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 animate-pulse'
                                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                    }`}>
                                      <Calendar className="w-3.5 h-3.5 text-readflow-gold shrink-0" />
                                      <span>Deadline: <strong className="font-mono">{opp.deadline}</strong></span>
                                      <span className="text-[10px] font-mono font-bold opacity-80">({countdown.text})</span>
                                    </div>

                                    {/* Google Calendar and iCal buttons */}
                                    <div className="inline-flex items-center gap-1">
                                      <a
                                        href={gCalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:bg-cream-200 dark:hover:bg-sepia-750 text-sepia-700 dark:text-cream-200 text-[10px] font-mono font-bold inline-flex items-center gap-1 border border-cream-200 dark:border-sepia-700"
                                        title="Add deadline to Google Calendar"
                                      >
                                        <ExternalLink className="w-2.5 h-2.5 text-readflow-gold" />
                                        Google Cal
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => downloadICalEvent(opp, opp.deadline!)}
                                        className="px-2 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:bg-cream-200 dark:hover:bg-sepia-750 text-sepia-700 dark:text-cream-200 text-[10px] font-mono font-bold inline-flex items-center gap-1 border border-cream-200 dark:border-sepia-700 cursor-pointer"
                                        title="Download iCal event (.ics)"
                                      >
                                        <Download className="w-2.5 h-2.5 text-readflow-green" />
                                        iCal
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Interactive Eligibility Checklist */}
                              <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>Eligibility Criteria Checklist</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                                    {eligibilityItems.filter((i) => i.completed).length}/{eligibilityItems.length} Met
                                  </span>
                                </div>
                                {eligibilityItems.length === 0 ? (
                                  <p className="text-[10px] text-sepia-400 italic">No eligibility criteria logged yet.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {eligibilityItems.map((item) => (
                                      <label
                                        key={item.id}
                                        className="flex items-start gap-2 p-1 rounded hover:bg-white/60 dark:hover:bg-sepia-900/40 transition-colors cursor-pointer text-xs"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={item.completed}
                                          onChange={() => handleToggleEligibilityItem(opp, item.id)}
                                          className="mt-0.5 accent-blue-600 rounded cursor-pointer w-3.5 h-3.5 shrink-0"
                                        />
                                        <span className={item.completed ? 'line-through text-sepia-400 dark:text-sepia-500 font-normal' : 'text-sepia-800 dark:text-cream-100 font-medium'}>
                                          {item.text}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Interactive Requirements Checklist */}
                              <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                    <ListChecks className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    <span>Application Requirements Checklist</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                                    {requirementsItems.filter((i) => i.completed).length}/{requirementsItems.length} Ready
                                  </span>
                                </div>
                                {requirementsItems.length === 0 ? (
                                  <p className="text-[10px] text-sepia-400 italic">No requirements logged yet.</p>
                                ) : (
                                  <div className="space-y-1">
                                    {requirementsItems.map((item) => (
                                      <label
                                        key={item.id}
                                        className="flex items-start gap-2 p-1 rounded hover:bg-white/60 dark:hover:bg-sepia-900/40 transition-colors cursor-pointer text-xs"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={item.completed}
                                          onChange={() => handleToggleRequirementItem(opp, item.id)}
                                          className="mt-0.5 accent-indigo-600 rounded cursor-pointer w-3.5 h-3.5 shrink-0"
                                        />
                                        <span className={item.completed ? 'line-through text-sepia-400 dark:text-sepia-500 font-normal' : 'text-sepia-800 dark:text-cream-100 font-medium'}>
                                          {item.text}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {opp.description && (
                          <div className="mt-2.5 text-xs text-sepia-700 dark:text-sepia-300 bg-cream-50/70 dark:bg-sepia-850/60 p-2.5 rounded-xl border border-cream-200/70 dark:border-sepia-800 font-sans leading-relaxed">
                            <span className="font-bold block mb-1 text-[10px] uppercase font-mono tracking-wider text-sepia-450 dark:text-sepia-400">
                              {opp.category === 'Scholarships' ? 'Additional Notes & Essay Prompts:' : opp.category === 'Farming' ? 'Field & Crop Notes:' : opp.category === 'Health' ? 'Workout & Health Log:' : opp.category === 'Learning' ? 'Key Takeaways & Reflections:' : 'Details & Scope:'}
                            </span>
                            <FormattedText text={opp.description} />
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="p-4 align-top">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${meta.bg} ${meta.border} ${meta.color}`}>
                          <Icon className="w-3 h-3" />
                          {opp.category}
                        </div>
                      </td>

                      {/* Points score */}
                      <td className="p-4 align-top">
                        <div className="font-mono font-extrabold text-readflow-green dark:text-readflow-lightgreen text-sm">
                          +{opp.points}
                        </div>
                      </td>

                      {/* Custom Interactive Stage dropdown */}
                      <td className="p-4 align-top">
                        <select
                          id={`quick-stage-select-${opp.id}`}
                          value={oppStage}
                          onChange={(e) => handleQuickStageSave(opp, e.target.value)}
                          className={`w-full text-[10px] font-bold px-2 py-1 rounded border cursor-pointer focus:outline-none ${
                            oppStage.includes('Won')
                              ? 'bg-readflow-green/10 dark:bg-readflow-olive/15 text-readflow-green border-readflow-green/20'
                              : oppStage.includes('Lost')
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-950/40'
                              : oppStage === 'Active'
                              ? 'bg-readflow-gold/15 text-readflow-olive dark:text-readflow-gold border-readflow-gold/30'
                              : 'bg-cream-50 dark:bg-sepia-850 text-sepia-700 dark:text-cream-200 border-cream-200 dark:border-sepia-800'
                          }`}
                        >
                          {STAGES.map((stg) => (
                            <option key={stg} value={stg}>{stg}</option>
                          ))}
                        </select>
                      </td>

                      {/* Direct Editable Qualitative Feedback Column */}
                      <td className="p-4 align-top">
                        <div className="relative group/feedback">
                          <textarea
                            id={`quick-feedback-input-${opp.id}`}
                            defaultValue={opp.feedback || ''}
                            placeholder="Click to add feedback/notes..."
                            onBlur={(e) => handleQuickFeedbackSave(opp, e.target.value)}
                            rows={opp.feedback && opp.feedback.length > 50 ? 3 : 2}
                            className="w-full bg-cream-50/40 hover:bg-white focus:bg-white dark:bg-sepia-850/30 dark:hover:bg-sepia-900 dark:focus:bg-sepia-900 border border-cream-200 dark:border-sepia-800 focus:border-readflow-green/60 rounded-xl p-2 text-xs text-sepia-800 dark:text-cream-100 transition-all font-sans resize-y focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Upload Files Attachment Column */}
                      <td className="p-4">
                        {opp.fileName ? (
                          <div className="flex items-center justify-between gap-1 bg-cream-50/50 dark:bg-sepia-850/40 px-2 py-1.5 rounded-lg border border-cream-150 dark:border-sepia-800/50">
                            <span
                              onClick={() => triggerDownload(opp)}
                              className="text-[10px] text-sepia-800 dark:text-cream-200 font-bold truncate max-w-[100px] hover:underline cursor-pointer flex items-center gap-1"
                              title="Download attachment"
                            >
                              <FileText className="w-3 h-3 text-readflow-green shrink-0" />
                              {opp.fileName}
                            </span>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button
                                id={`file-dl-${opp.id}`}
                                onClick={() => triggerDownload(opp)}
                                className="p-1 rounded text-sepia-450 hover:text-readflow-green hover:bg-cream-100 dark:hover:bg-sepia-800 cursor-pointer"
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button
                                id={`file-remove-${opp.id}`}
                                onClick={() => handleRemoveFile(opp)}
                                className="p-1 rounded text-sepia-450 hover:text-red-500 hover:bg-cream-100 dark:hover:bg-sepia-800 cursor-pointer"
                                title="Remove file"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => handleDragOver(e, opp.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, opp)}
                            className={`border border-dashed rounded-lg p-2 text-center transition-all ${
                              dragActiveId === opp.id
                                ? 'border-readflow-green bg-cream-50/50 dark:bg-sepia-800/10 scale-95'
                                : 'border-cream-200 dark:border-sepia-800 hover:border-readflow-green/60'
                            }`}
                          >
                            <input
                              id={`file-input-${opp.id}`}
                              ref={(el) => (fileInputRefs.current[opp.id] = el)}
                              type="file"
                              onChange={(e) => handleFileChange(opp, e)}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                            />
                            <button
                              id={`trigger-upload-${opp.id}`}
                              onClick={() => fileInputRefs.current[opp.id]?.click()}
                              className="text-[10px] text-sepia-450 hover:text-readflow-green font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                            >
                              <FileUp className="w-3.5 h-3.5" />
                              Attach File
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Connect / Open in Pipeline Column */}
                      <td className="p-4 text-center">
                        <button
                          id={`pipeline-action-${opp.id}`}
                          onClick={() => handlePipelineAction(opp)}
                          className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            opp.pipelineId
                              ? 'bg-readflow-green text-cream-50 hover:bg-readflow-olive shadow-sm'
                              : 'border border-cream-200 dark:border-sepia-800 text-sepia-650 dark:text-cream-250 hover:bg-cream-50 dark:hover:bg-sepia-850'
                          }`}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          {opp.pipelineId ? 'Open Pipeline ↗' : 'Start Lifecycle'}
                        </button>
                      </td>

                      {/* Action controls */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`edit-btn-${opp.id}`}
                            onClick={() => startEditing(opp)}
                            className="text-sepia-400 hover:text-readflow-green p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-btn-${opp.id}`}
                            onClick={() => {
                              if (confirm('Are you sure you want to permanently delete this opportunity? This cannot be undone.')) {
                                onDeleteOpportunity(opp.id);
                              }
                            }}
                            className="text-sepia-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Footer */}
        <div className="bg-cream-50/55 dark:bg-sepia-900 border-t border-cream-150 dark:border-sepia-800 px-4 py-3 flex items-center justify-between text-xs text-sepia-450">
          <div>
            Showing <span className="font-bold text-sepia-700 dark:text-cream-100">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-sepia-700 dark:text-cream-100">
              {Math.min(startIndex + ITEMS_PER_PAGE, sortedOpps.length)}
            </span>{' '}
            of <span className="font-bold text-sepia-700 dark:text-cream-100">{sortedOpps.length}</span> opportunities
          </div>

          <div className="flex items-center gap-2">
            <button
              id="logbook-prev-page"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 hover:bg-cream-100 dark:hover:bg-sepia-800 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-sepia-700 dark:text-cream-100">
              Page {currentPage} of {totalPages}
            </span>
            <button
              id="logbook-next-page"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 hover:bg-cream-100 dark:hover:bg-sepia-800 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
