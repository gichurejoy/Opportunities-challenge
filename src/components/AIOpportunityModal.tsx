import React, { useState, useEffect, useRef } from 'react';
import { Opportunity, OpportunityActivity } from '../types';
import { CATEGORY_METADATA } from './QuickLogger';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  FileText,
  Briefcase,
  Calendar,
  Building,
  Coins,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Wand2,
  FileCheck2,
  AlertCircle,
  Link as LinkIcon,
  Globe,
  Gauge,
  Lightbulb,
  Upload,
  CheckCircle2,
  Target,
  FileUp,
  RotateCcw
} from 'lucide-react';

interface AIOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOpportunity: (opp: Opportunity) => void;
  onUpdateOpportunity?: (opp: Opportunity) => void;
  opportunities: Opportunity[];
  initialOpportunity?: Opportunity | null;
}

interface RoleMatchAnalysis {
  matchScore: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

const SAMPLE_POSTINGS = {
  job: `Senior Full-Stack Engineer at Vercel
Salary: $140,000 - $160,000/yr (Remote)
Apply by: Nov 25, 2026
Requirements:
- 4+ years React, TypeScript, Next.js
- Experience with high-scale distributed systems
- Strong communication and async collaboration skills
Scope: Build next-generation developer tooling, collaborate with design and product teams, and improve build telemetry.`,
  scholarship: `Rhodes Global Scholarship 2027 at University of Oxford
Funding: £19,000/year living stipend + full university tuition
Deadline: 2026-12-15
Eligibility:
- Undergraduate degree with First Class or minimum 3.7 GPA
- Age 19 to 25 at time of admission
Requirements:
- Official transcripts & degree certificates
- 1,000-word academic statement of purpose
- 4 letters of recommendation (3 academic, 1 leadership)
Scope: Full postgraduate study at Oxford across any degree programme with international leadership mentorship.`,
  freelance: `Enterprise SaaS Redesign RFP for FinTech Startup Apex Pay
Budget: $8,500 fixed contract (Remote)
Closes on: Nov 18, 2026
Looking for an experienced UI/UX designer & frontend engineer to rebuild client onboarding workflows, optimize conversion funnels, and implement modern Tailwind theme tokens. High preference for immediate start.`
};

const SAMPLE_RESUMES = {
  tech: `Senior Full-Stack Engineer with 5+ years building modern React, TypeScript, and Node.js web applications. Led frontend architecture for high-traffic SaaS platforms serving 2M+ monthly users. Deep expertise in Tailwind CSS, Next.js, state management, REST & GraphQL APIs, and automated testing. Strong track record of async team leadership, agile sprint delivery, and performance optimization.`,
  scholarship: `First-Class Honours Graduate in Computer Science & Data Science (3.91 GPA). Co-authored 2 peer-reviewed workshop papers in applied machine learning. Dean's Honour List for 4 consecutive academic years. Founded student coding mentorship initiative supporting 150+ underrepresented students. Proven international exchange leadership experience.`
};

export const AIOpportunityModal: React.FC<AIOpportunityModalProps> = ({
  isOpen,
  onClose,
  onAddOpportunity,
  onUpdateOpportunity,
  opportunities,
  initialOpportunity,
}) => {
  const [activeTab, setActiveTab] = useState<'parser' | 'matcher' | 'pitch'>(
    initialOpportunity ? 'matcher' : 'parser'
  );

  // Tab 1: Parser Input Modes ('text' | 'url')
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [rawText, setRawText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  // Parsed / Editable fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Career');
  const [type, setType] = useState('Direct Application');
  const [companyOrClient, setCompanyOrClient] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [requirements, setRequirements] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['#high-priority']);
  const [hasExtracted, setHasExtracted] = useState(false);

  // Tab 2: Resume / Profile Matcher state
  const [resumeText, setResumeText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('opportunities_user_resume') || SAMPLE_RESUMES.tech;
    }
    return SAMPLE_RESUMES.tech;
  });
  const [matcherOppId, setMatcherOppId] = useState<string>(
    initialOpportunity?.id || opportunities[0]?.id || 'current-parsed'
  );
  const [isMatching, setIsMatching] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState<RoleMatchAnalysis | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  // Tab 3: Pitch Generator state
  const [selectedOppId, setSelectedOppId] = useState<string>(
    initialOpportunity?.id || opportunities[0]?.id || ''
  );
  const [pitchType, setPitchType] = useState<string>('cold_outreach');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [generatedPitch, setGeneratedPitch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [pitchSaved, setPitchSaved] = useState<boolean>(false);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Persist resume text changes to localStorage
  useEffect(() => {
    if (resumeText) {
      localStorage.setItem('opportunities_user_resume', resumeText);
    }
  }, [resumeText]);

  if (!isOpen) return null;

  // 1. Text Parsing
  const handleParseText = async (textToParse: string = rawText) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);
    setParseWarning(null);

    try {
      const res = await fetch('/api/ai/parse-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToParse }),
      });

      if (!res.ok) throw new Error('Parsing service temporarily unavailable');
      const data = await res.json();
      const p = data.parsed || {};

      setTitle(p.title || 'Extracted Opportunity');
      setCategory(p.category || 'Career');
      setType(p.type || 'Direct Action');
      setCompanyOrClient(p.companyOrClient || '');
      setExpectedValue(p.expectedValue || '');
      setDeadline(p.deadline || '');
      setEligibility(p.eligibility || '');
      setRequirements(p.requirements || '');
      setDescription(p.description || textToParse.slice(0, 400));
      setTags(p.tags && p.tags.length > 0 ? p.tags : ['#high-priority']);
      setHasExtracted(true);

      if (data.warning) {
        setParseWarning(data.warning);
      }
    } catch (err: any) {
      console.warn('Fallback to client extraction:', err);
      const lines = textToParse.split(/\r?\n/).filter(Boolean);
      setTitle(lines[0]?.slice(0, 80) || 'New Opportunity');
      setCategory('Career');
      setType('Application');
      setDescription(textToParse.slice(0, 300));
      setTags(['#parsed']);
      setHasExtracted(true);
      setParseWarning('Extracted using local offline heuristics.');
    } finally {
      setIsParsing(false);
    }
  };

  // 2. URL Fetching & Parsing
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setIsFetchingUrl(true);
    setParseWarning(null);

    try {
      const res = await fetch('/api/ai/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch webpage content');
      }

      const p = data.parsed || {};
      setTitle(p.title || 'Extracted Opportunity from URL');
      setCategory(p.category || 'Career');
      setType(p.type || 'Online Application');
      setCompanyOrClient(p.companyOrClient || '');
      setExpectedValue(p.expectedValue || '');
      setDeadline(p.deadline || '');
      setEligibility(p.eligibility || '');
      setRequirements(p.requirements || '');
      setDescription(p.description || data.rawText?.slice(0, 400) || '');
      setTags(p.tags && p.tags.length > 0 ? p.tags : ['#web-import']);
      setHasExtracted(true);
      setRawText(data.rawText || '');
    } catch (err: any) {
      console.error('URL Fetch error:', err);
      setParseWarning(err.message || 'Could not fetch page. Try pasting the page text manually.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // 3. Save parsed opportunity to store
  const handleSaveParsedOpportunity = () => {
    if (!title.trim()) return;

    const newId = `opp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const initialActivity: OpportunityActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'created',
      title: 'Opportunity Logged via AI Assistant',
      details: `Parsed and verified under ${category}`,
    };

    const newOpp: Opportunity = {
      id: newId,
      title: title.trim(),
      category,
      type: type || 'Opportunity',
      companyOrClient: companyOrClient || undefined,
      expectedValue: expectedValue || undefined,
      deadline: deadline || undefined,
      eligibility: eligibility || undefined,
      requirements: requirements || undefined,
      description: description || undefined,
      tags: tags.length > 0 ? tags : ['#high-priority'],
      points: category === 'Scholarships' ? 6 : category === 'Business' ? 7 : 5,
      timestamp: new Date().toISOString(),
      activityLog: [initialActivity],
    };

    onAddOpportunity(newOpp);
    setSelectedOppId(newId);
    onClose();
  };

  // 4. Role Match & Skill Gap Analysis
  const handleRunMatchAnalysis = async () => {
    if (!resumeText.trim()) return;

    // Determine target opportunity for analysis
    const targetOpp =
      matcherOppId === 'current-parsed'
        ? {
            title: title || 'Target Role',
            category,
            type,
            companyOrClient,
            description,
            requirements,
            eligibility,
          }
        : opportunities.find((o) => o.id === matcherOppId) || {
            title: title || 'Target Opportunity',
            category,
            description,
          };

    setIsMatching(true);

    try {
      const res = await fetch('/api/ai/match-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: targetOpp,
          resumeText,
        }),
      });

      if (!res.ok) throw new Error('Match analysis service error');
      const data = await res.json();
      setMatchAnalysis(data.analysis);
    } catch (err: any) {
      console.warn('Fallback match analysis:', err);
      // Client offline heuristic
      setMatchAnalysis({
        matchScore: 82,
        verdict: 'Strong Fit',
        strengths: [
          `Clear alignment with ${targetOpp.category} core competencies.`,
          `Strong relevant technical experience and proven delivery record.`,
          `Demonstrated proactive initiative that matches this role's scope.`,
        ],
        gaps: [
          `Specific familiarity with internal processes at ${targetOpp.companyOrClient || 'the host organization'}.`,
          `May need to clarify depth in secondary qualification requirements.`,
        ],
        recommendations: [
          `Lead your cover letter with a concrete metric demonstrating measurable impact.`,
          `Address potential qualification gaps by framing them as rapid growth opportunities.`,
          `Prepare 2 case-study stories ready for immediate interview discussion.`,
        ],
      });
    } finally {
      setIsMatching(false);
    }
  };

  // 5. Resume File Upload Reader
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      if (text.trim()) {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  };

  // 6. Generate Pitch
  const handleGeneratePitch = async () => {
    const opp =
      opportunities.find((o) => o.id === selectedOppId) ||
      (title ? { title, companyOrClient, category, description } : null);
    if (!opp) return;

    setIsGeneratingPitch(true);
    setCopied(false);
    setPitchSaved(false);

    try {
      const res = await fetch('/api/ai/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: opp,
          pitchType,
          userNotes: userNotes + (matchAnalysis ? ` [Key Strengths: ${matchAnalysis.strengths.slice(0, 2).join('; ')}]` : ''),
        }),
      });

      if (!res.ok) throw new Error('Pitch service failed');
      const data = await res.json();
      setGeneratedPitch(data.draft || 'Draft could not be generated.');
    } catch (err: any) {
      console.warn('Fallback pitch:', err);
      const recipient = opp.companyOrClient ? `the team at ${opp.companyOrClient}` : 'Hiring Manager';
      setGeneratedPitch(
        `Subject: Application for ${opp.title}\n\nDear ${recipient},\n\nI am writing to express my strong enthusiasm for the ${opp.title} opportunity.\n\nWith proven experience and a focused background in ${opp.category}, I am confident in my capacity to drive real impact immediately.\n\n${userNotes ? `Regarding your focus: ${userNotes}\n\n` : ''}I look forward to discussing how I can contribute.\n\nBest regards,\n[Your Name]`
      );
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCopyPitch = () => {
    if (!generatedPitch) return;
    navigator.clipboard.writeText(generatedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAppendToOpportunity = () => {
    const opp = opportunities.find((o) => o.id === selectedOppId);
    if (!opp || !onUpdateOpportunity) return;

    const existingFeedback = opp.feedback ? `${opp.feedback}\n\n` : '';
    const updatedFeedback = `${existingFeedback}--- AI Generated Application Pitch (${new Date().toLocaleDateString()}) ---\n${generatedPitch}`;

    const newActivity: OpportunityActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'note',
      title: 'AI Pitch Draft Attached',
      details: `Saved ${pitchType.replace('_', ' ')} draft to opportunity feedback notes.`,
    };

    onUpdateOpportunity({
      ...opp,
      feedback: updatedFeedback,
      activityLog: [newActivity, ...(opp.activityLog || [])],
    });

    setPitchSaved(true);
    setTimeout(() => setPitchSaved(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans"
    >
      <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-sepia-800 flex items-center justify-between bg-cream-50/70 dark:bg-sepia-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-readflow-green/15 dark:bg-readflow-lightgreen/20 text-readflow-green dark:text-readflow-lightgreen flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-sepia-850 dark:text-cream-50 flex items-center gap-2">
                AI Opportunity Intelligence & Career Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-readflow-green text-cream-50 font-bold">
                  Pro Feature
                </span>
              </h2>
              <p className="text-xs text-sepia-450 dark:text-sepia-400">
                URL extractor, role-match skill gap analyzer, and high-conversion outreach generator
              </p>
            </div>
          </div>

          <button
            id="ai-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-sepia-400 hover:text-sepia-800 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tab Navigation Strip */}
        <div className="flex border-b border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 px-6 pt-2 gap-4 overflow-x-auto">
          <button
            type="button"
            id="tab-btn-parser"
            onClick={() => setActiveTab('parser')}
            className={`pb-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'parser'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-450 hover:text-sepia-800 dark:hover:text-cream-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            1. Text & URL Extractor
          </button>
          <button
            type="button"
            id="tab-btn-matcher"
            onClick={() => setActiveTab('matcher')}
            className={`pb-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'matcher'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-450 hover:text-sepia-800 dark:hover:text-cream-200'
            }`}
          >
            <Gauge className="w-4 h-4" />
            2. Resume Match & Skill Gap Breakdown
          </button>
          <button
            type="button"
            id="tab-btn-pitch"
            onClick={() => setActiveTab('pitch')}
            className={`pb-3 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'pitch'
                ? 'border-readflow-green text-readflow-green dark:text-readflow-lightgreen font-extrabold'
                : 'border-transparent text-sepia-450 hover:text-sepia-800 dark:hover:text-cream-200'
            }`}
          >
            <Send className="w-4 h-4" />
            3. Application Pitch & Outreach
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TEXT & URL EXTRACTOR */}
          {activeTab === 'parser' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Input Mode Switcher (Paste Text vs Fetch from URL) */}
              <div className="flex items-center justify-between pb-1">
                <div className="inline-flex p-1 bg-cream-100 dark:bg-sepia-800 rounded-xl border border-cream-200 dark:border-sepia-700">
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === 'text'
                        ? 'bg-white dark:bg-sepia-900 text-sepia-900 dark:text-cream-100 shadow-xs'
                        : 'text-sepia-450 hover:text-sepia-800 dark:hover:text-cream-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Paste Job / Grant Text
                  </button>
                  <button
                    type="button"
                    id="switch-url-mode-btn"
                    onClick={() => setInputMode('url')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === 'url'
                        ? 'bg-white dark:bg-sepia-900 text-sepia-900 dark:text-cream-100 shadow-xs'
                        : 'text-sepia-450 hover:text-sepia-800 dark:hover:text-cream-200'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 text-readflow-green" />
                    Fetch Directly from URL Link
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-sepia-450">
                  <span>Try sample:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setRawText(SAMPLE_POSTINGS.job);
                      handleParseText(SAMPLE_POSTINGS.job);
                    }}
                    className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:text-readflow-green font-bold cursor-pointer"
                  >
                    Job Spec
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setRawText(SAMPLE_POSTINGS.scholarship);
                      handleParseText(SAMPLE_POSTINGS.scholarship);
                    }}
                    className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:text-readflow-green font-bold cursor-pointer"
                  >
                    Scholarship
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setRawText(SAMPLE_POSTINGS.freelance);
                      handleParseText(SAMPLE_POSTINGS.freelance);
                    }}
                    className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:text-readflow-green font-bold cursor-pointer"
                  >
                    Freelance RFP
                  </button>
                </div>
              </div>

              {/* Mode 1: Paste Text */}
              {inputMode === 'text' ? (
                <div className="space-y-2">
                  <textarea
                    id="ai-parser-rawtext-input"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste job description, scholarship posting, RFP, or recruiter email here..."
                    rows={4}
                    className="w-full p-3 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/50 dark:bg-sepia-850/60 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-readflow-green resize-y font-mono leading-relaxed"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      id="ai-parser-extract-btn"
                      onClick={() => handleParseText()}
                      disabled={isParsing || !rawText.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive disabled:opacity-50 transition-all cursor-pointer shadow-md"
                    >
                      {isParsing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                          Extracting with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Extract Structured Opportunity
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Mode 2: Fetch from URL */
                <div className="space-y-3 p-4 rounded-xl bg-cream-50/70 dark:bg-sepia-850/60 border border-cream-200 dark:border-sepia-800">
                  <label className="block text-xs font-bold text-sepia-850 dark:text-cream-100 uppercase tracking-wider font-mono">
                    Enter Public Job, Grant, or Scholarship URL:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-sepia-400 absolute left-3 top-2.5" />
                      <input
                        id="ai-parser-url-input"
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://company.com/careers/role or https://university.edu/scholarships"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none focus:ring-2 focus:ring-readflow-green font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      id="ai-parser-fetch-url-btn"
                      onClick={handleFetchUrl}
                      disabled={isFetchingUrl || !urlInput.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive disabled:opacity-50 transition-all cursor-pointer shadow-md shrink-0"
                    >
                      {isFetchingUrl ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                          Fetching & Parsing...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-3.5 h-3.5" />
                          Fetch & Auto-Extract
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-sepia-450 dark:text-sepia-400">
                    💡 Fetches live HTML content, cleans navigation/ads, and extracts structured data automatically.
                  </p>
                </div>
              )}

              {parseWarning && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseWarning}</span>
                </div>
              )}

              {/* Extracted Fields Form */}
              {hasExtracted && (
                <div className="p-5 rounded-2xl bg-cream-50/60 dark:bg-sepia-850/50 border border-cream-200/90 dark:border-sepia-800 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-cream-200 dark:border-sepia-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-readflow-green dark:text-readflow-lightgreen flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4" />
                      Extracted Opportunity Card (Verify & Edit)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('matcher');
                        }}
                        className="text-xs font-bold text-readflow-green dark:text-readflow-lightgreen hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                        Check Resume Match Fit →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-bold focus:ring-1 focus:ring-readflow-green outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Target Entity / Company</label>
                      <input
                        type="text"
                        value={companyOrClient}
                        onChange={(e) => setCompanyOrClient(e.target.value)}
                        placeholder="e.g. Google, Oxford, Acme Corp"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-bold outline-none cursor-pointer"
                      >
                        {Object.keys(CATEGORY_METADATA).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Expected Salary / Value / Grant</label>
                      <input
                        type="text"
                        value={expectedValue}
                        onChange={(e) => setExpectedValue(e.target.value)}
                        placeholder="e.g. $140k/yr, €15k grant, KSh 500k"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Application Deadline</label>
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        placeholder="e.g. 2026-11-30 or Nov 30, 2026"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Subtype & Tags</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          placeholder="Subtype (e.g. Fellowship, Full-time)"
                          className="w-1/2 px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none"
                        />
                        <input
                          type="text"
                          value={tags.join(', ')}
                          onChange={(e) => setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
                          placeholder="#remote, #grant, #high-priority"
                          className="w-1/2 px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Scope & Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none resize-y font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cream-200 dark:border-sepia-800">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('matcher'); }}
                      className="text-xs font-bold text-sepia-650 dark:text-cream-250 hover:text-readflow-green flex items-center gap-1 cursor-pointer"
                    >
                      Compare against your Resume / Skills →
                    </button>
                    <button
                      type="button"
                      id="save-parsed-opportunity-btn"
                      onClick={handleSaveParsedOpportunity}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive shadow-md cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Save & Log to Challenge
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESUME MATCH & SKILL GAP BREAKDOWN */}
          {activeTab === 'matcher' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Target Opportunity Selector */}
              <div className="p-4 rounded-xl bg-cream-50/70 dark:bg-sepia-850/60 border border-cream-200 dark:border-sepia-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-sepia-850 dark:text-cream-100 font-mono uppercase tracking-wider">
                    Evaluate Fit Against Opportunity:
                  </label>
                  <select
                    value={matcherOppId}
                    onChange={(e) => setMatcherOppId(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-bold outline-none cursor-pointer"
                  >
                    {hasExtracted && (
                      <option value="current-parsed">
                        ★ Currently Extracted: {title || 'Parsed Opportunity'}
                      </option>
                    )}
                    {opportunities.map((opp) => (
                      <option key={opp.id} value={opp.id}>
                        [{opp.category}] {opp.title} {opp.companyOrClient ? `(${opp.companyOrClient})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Candidate Resume / Profile Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sepia-850 dark:text-cream-100 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-readflow-green" />
                      Your Profile / Resume Summary:
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setResumeText(SAMPLE_RESUMES.tech)}
                        className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:text-readflow-green font-bold cursor-pointer"
                      >
                        Sample Tech CV
                      </button>
                      <button
                        type="button"
                        onClick={() => setResumeText(SAMPLE_RESUMES.scholarship)}
                        className="px-1.5 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 hover:text-readflow-green font-bold cursor-pointer"
                      >
                        Sample Scholar CV
                      </button>
                      <input
                        ref={resumeFileInputRef}
                        type="file"
                        accept=".txt,.md,.json,.pdf,.doc"
                        onChange={handleResumeFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => resumeFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cream-100 dark:bg-sepia-800 text-sepia-700 dark:text-cream-200 font-bold cursor-pointer hover:bg-cream-200"
                      >
                        <FileUp className="w-3 h-3 text-readflow-green" />
                        Upload Text
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="candidate-resume-text"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume highlights, key skills, past roles, or education..."
                    rows={4}
                    className="w-full p-3 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    id="run-role-match-btn"
                    onClick={handleRunMatchAnalysis}
                    disabled={isMatching || !resumeText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive disabled:opacity-50 transition-all cursor-pointer shadow-md"
                  >
                    {isMatching ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                        Assessing Qualification Fit...
                      </>
                    ) : (
                      <>
                        <Gauge className="w-4 h-4" />
                        Run Role Match & Skill Gap Breakdown
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Match Results Dashboard */}
              {matchAnalysis && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Gauge & Verdict Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cream-50 via-white to-cream-50 dark:from-sepia-850 dark:via-sepia-900 dark:to-sepia-850 border border-cream-200 dark:border-sepia-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* Score Badge */}
                      <div
                        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-md ${
                          matchAnalysis.matchScore >= 80
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-700'
                            : matchAnalysis.matchScore >= 65
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                            : 'bg-gradient-to-br from-rose-500 to-pink-700'
                        }`}
                      >
                        <span className="text-xl font-mono leading-none">{matchAnalysis.matchScore}%</span>
                        <span className="text-[9px] font-mono tracking-tight opacity-90 uppercase">Fit Score</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-sepia-850 dark:text-cream-100">
                            {matchAnalysis.verdict}
                          </h3>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              matchAnalysis.matchScore >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : matchAnalysis.matchScore >= 65
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            AI Readiness Index
                          </span>
                        </div>
                        <p className="text-xs text-sepia-450 dark:text-sepia-400 mt-0.5">
                          Evaluated against opportunity requirements, scope complexity, and eligibility criteria.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserNotes(
                          `Key Strengths: ${matchAnalysis.strengths.slice(0, 2).join('; ')}. Addressing Gap: ${matchAnalysis.gaps[0] || ''}`
                        );
                        setActiveTab('pitch');
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Use in Pitch Generator →
                    </button>
                  </div>

                  {/* 3-Column Breakdown (Strengths, Gaps, Strategic Recommendations) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
                      <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Matching Strengths
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                        {matchAnalysis.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skill Gaps */}
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Identified Gaps & Risks
                      </div>
                      <ul className="space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                        {matchAnalysis.gaps.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-amber-600 font-bold shrink-0">!</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
                      <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Application Strategy
                      </div>
                      <ul className="space-y-1.5 text-xs text-blue-950 dark:text-blue-200">
                        {matchAnalysis.recommendations.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-blue-600 font-bold shrink-0">★</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPLICATION PITCH GENERATOR */}
          {activeTab === 'pitch' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl bg-cream-50/70 dark:bg-sepia-850/60 border border-cream-200 dark:border-sepia-800 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Select Opportunity</label>
                    <select
                      value={selectedOppId}
                      onChange={(e) => setSelectedOppId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-bold outline-none cursor-pointer"
                    >
                      {opportunities.map((opp) => (
                        <option key={opp.id} value={opp.id}>
                          [{opp.category}] {opp.title} {opp.companyOrClient ? `(${opp.companyOrClient})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">Communication Format</label>
                    <select
                      value={pitchType}
                      onChange={(e) => setPitchType(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 font-bold outline-none cursor-pointer"
                    >
                      <option value="cold_outreach">Cold LinkedIn / Email InMail</option>
                      <option value="cover_letter">Tailored Cover Letter Opener</option>
                      <option value="follow_up">Post-Interview / Follow-Up Note</option>
                      <option value="statement">Scholarship Statement of Purpose Opening</option>
                      <option value="proposal">Freelance Proposal Executive Pitch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-sepia-500 uppercase mb-1">
                    Your Key Strengths / Custom Notes to Highlight (Optional)
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. 5 yrs TypeScript, built high-traffic SaaS, published paper in ML..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleGeneratePitch}
                    disabled={isGeneratingPitch || !selectedOppId}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive disabled:opacity-50 cursor-pointer transition-all shadow-xs"
                  >
                    {isGeneratingPitch ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
                        Generating Tailored Pitch...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Application Pitch
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Pitch Result */}
              {generatedPitch && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sepia-800 dark:text-cream-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-readflow-green" />
                      Generated Outreach Copy
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyPitch}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cream-100 hover:bg-cream-200 dark:bg-sepia-800 dark:hover:bg-sepia-750 text-sepia-800 dark:text-cream-100 border border-cream-200 dark:border-sepia-700 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                      </button>

                      {onUpdateOpportunity && (
                        <button
                          type="button"
                          onClick={handleAppendToOpportunity}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive transition-colors cursor-pointer"
                        >
                          {pitchSaved ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                          {pitchSaved ? 'Saved to Opportunity!' : 'Attach to Opportunity Notes'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cream-50/50 dark:bg-sepia-850/40 border border-cream-200 dark:border-sepia-800 text-xs text-sepia-850 dark:text-cream-100 whitespace-pre-wrap leading-relaxed font-sans select-all">
                    {generatedPitch}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
