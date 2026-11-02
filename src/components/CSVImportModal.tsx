import React, { useState, useEffect, useRef } from 'react';
import { Opportunity, OpportunityActivity } from '../types';
import { CATEGORY_METADATA } from './QuickLogger';
import {
  Upload,
  X,
  FileSpreadsheet,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Database
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportOpportunities: (newOpps: Opportunity[]) => void;
}

interface ColumnMapping {
  title: string;
  category: string;
  companyOrClient: string;
  expectedValue: string;
  type: string;
  stage: string;
  deadline: string;
  description: string;
  tags: string;
}

const SYSTEM_FIELDS: Array<{ key: keyof ColumnMapping; label: string; required?: boolean }> = [
  { key: 'title', label: 'Opportunity Title', required: true },
  { key: 'category', label: 'Category' },
  { key: 'companyOrClient', label: 'Company / Target Entity' },
  { key: 'expectedValue', label: 'Expected Salary / Value' },
  { key: 'type', label: 'Subtype / Format' },
  { key: 'stage', label: 'Stage Status' },
  { key: 'deadline', label: 'Application Deadline' },
  { key: 'description', label: 'Scope / Notes / Feedback' },
  { key: 'tags', label: 'Tags' },
];

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportOpportunities,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    title: '',
    category: '',
    companyOrClient: '',
    expectedValue: '',
    type: '',
    stage: '',
    deadline: '',
    description: '',
    tags: '',
  });
  const [defaultCategory, setDefaultCategory] = useState<string>('Career');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Simple and robust CSV line splitter accounting for quotes
  const parseCSVLine = (text: string, delimiter: string = ','): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const processFile = (f: File) => {
    setFile(f);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return;

      // Detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

      const headers = parseCSVLine(firstLine, delimiter).map((h) => h.replace(/^["']|["']$/g, '').trim());
      const dataRows = lines.slice(1).map((l) => parseCSVLine(l, delimiter));

      setCsvHeaders(headers);
      setRawRows(dataRows);

      // Auto-heuristic mapping
      const mapping: ColumnMapping = {
        title: '',
        category: '',
        companyOrClient: '',
        expectedValue: '',
        type: '',
        stage: '',
        deadline: '',
        description: '',
        tags: '',
      };

      headers.forEach((h) => {
        const lower = h.toLowerCase();
        if (!mapping.title && (lower.includes('title') || lower.includes('role') || lower.includes('opportunity') || lower.includes('position') || lower.includes('name'))) {
          mapping.title = h;
        } else if (!mapping.category && lower.includes('cat')) {
          mapping.category = h;
        } else if (!mapping.companyOrClient && (lower.includes('comp') || lower.includes('client') || lower.includes('org') || lower.includes('target') || lower.includes('univ'))) {
          mapping.companyOrClient = h;
        } else if (!mapping.expectedValue && (lower.includes('val') || lower.includes('sal') || lower.includes('comp') || lower.includes('grant') || lower.includes('budget') || lower.includes('rate'))) {
          mapping.expectedValue = h;
        } else if (!mapping.type && (lower.includes('type') || lower.includes('format') || lower.includes('kind'))) {
          mapping.type = h;
        } else if (!mapping.stage && (lower.includes('stage') || lower.includes('status'))) {
          mapping.stage = h;
        } else if (!mapping.deadline && (lower.includes('dead') || lower.includes('due') || lower.includes('date'))) {
          mapping.deadline = h;
        } else if (!mapping.description && (lower.includes('desc') || lower.includes('note') || lower.includes('feed') || lower.includes('detail') || lower.includes('scope'))) {
          mapping.description = h;
        } else if (!mapping.tags && lower.includes('tag')) {
          mapping.tags = h;
        }
      });

      // Fallback if title still not found, pick first column
      if (!mapping.title && headers.length > 0) {
        mapping.title = headers[0];
      }

      setColumnMapping(mapping);
    };

    reader.readAsText(f);
  };

  const handleDownloadSample = () => {
    const headers = [
      'Opportunity Title',
      'Category',
      'Target Company / Client',
      'Expected Salary or Grant Value',
      'Subtype',
      'Stage',
      'Application Deadline',
      'Scope and Notes',
      'Tags',
    ];

    const sampleRows = [
      [
        'Senior Full-Stack Cloud Engineer',
        'Career',
        'Vercel',
        '$150,000/yr',
        'Full-time Job',
        'Applied',
        '2026-11-25',
        'Remote cloud developer tooling role. Prepared custom portfolio demo.',
        '#remote, #high-priority',
      ],
      [
        'Gates Cambridge Leadership Fellowship',
        'Scholarships',
        'University of Cambridge',
        '£20,000/yr + Tuition',
        'Fellowship',
        'Sourced',
        '2026-12-05',
        'Fully-funded postgraduate study with global leadership cohort.',
        '#fellowship, #urgent',
      ],
      [
        'Enterprise E-commerce Platform Redesign',
        'Business',
        'Apex Retail Solutions',
        '$12,000 contract',
        'RFP Proposal',
        'Proposal Sent',
        '2026-11-15',
        'Complete Shopify Plus store redesign and conversion optimization.',
        '#freelance',
      ],
      [
        'Avocado Hass Seedling Supply Expansion',
        'Farming',
        'Highland Cooperative',
        'KSh 450,000',
        'Crop Expansion',
        'Discovery',
        '2026-12-01',
        'Pre-order supply contract for 500 certified grafted Hass seedlings.',
        '#farming',
      ],
    ];

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'opportunities_challenge_sample_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = () => {
    if (!columnMapping.title || rawRows.length === 0) return;

    setIsProcessing(true);

    const titleIdx = csvHeaders.indexOf(columnMapping.title);
    const catIdx = columnMapping.category ? csvHeaders.indexOf(columnMapping.category) : -1;
    const compIdx = columnMapping.companyOrClient ? csvHeaders.indexOf(columnMapping.companyOrClient) : -1;
    const valIdx = columnMapping.expectedValue ? csvHeaders.indexOf(columnMapping.expectedValue) : -1;
    const typeIdx = columnMapping.type ? csvHeaders.indexOf(columnMapping.type) : -1;
    const stageIdx = columnMapping.stage ? csvHeaders.indexOf(columnMapping.stage) : -1;
    const deadlineIdx = columnMapping.deadline ? csvHeaders.indexOf(columnMapping.deadline) : -1;
    const descIdx = columnMapping.description ? csvHeaders.indexOf(columnMapping.description) : -1;
    const tagsIdx = columnMapping.tags ? csvHeaders.indexOf(columnMapping.tags) : -1;

    const validCategories = Object.keys(CATEGORY_METADATA);
    const importedOpps: Opportunity[] = [];

    rawRows.forEach((row, i) => {
      const rawTitle = titleIdx >= 0 ? row[titleIdx] : '';
      if (!rawTitle || !rawTitle.trim()) return;

      let rowCategory = catIdx >= 0 && row[catIdx] ? row[catIdx].trim() : defaultCategory;
      // Match case-insensitively or fallback
      const matchedCat = validCategories.find((c) => c.toLowerCase() === rowCategory.toLowerCase());
      if (matchedCat) {
        rowCategory = matchedCat;
      } else {
        rowCategory = defaultCategory;
      }

      const rawTags = tagsIdx >= 0 && row[tagsIdx] ? row[tagsIdx] : '';
      const parsedTags = rawTags
        ? rawTags
            .split(/[,;\s]+/)
            .map((t) => (t.startsWith('#') ? t : `#${t}`))
            .filter((t) => t.length > 1)
        : ['#imported'];

      const initialActivity: OpportunityActivity = {
        id: `act-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        type: 'created',
        title: 'Imported from Spreadsheet',
        details: `Batch imported from ${file?.name || 'CSV file'}.`,
      };

      importedOpps.push({
        id: `opp-csv-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        title: rawTitle.trim(),
        category: rowCategory,
        type: (typeIdx >= 0 && row[typeIdx]?.trim()) || 'Imported Action',
        companyOrClient: compIdx >= 0 && row[compIdx] ? row[compIdx].trim() : undefined,
        expectedValue: valIdx >= 0 && row[valIdx] ? row[valIdx].trim() : undefined,
        stage: stageIdx >= 0 && row[stageIdx] ? row[stageIdx].trim() : undefined,
        deadline: deadlineIdx >= 0 && row[deadlineIdx] ? row[deadlineIdx].trim() : undefined,
        description: descIdx >= 0 && row[descIdx] ? row[descIdx].trim() : undefined,
        tags: parsedTags,
        points: rowCategory === 'Scholarships' ? 6 : rowCategory === 'Business' ? 7 : 5,
        timestamp: new Date().toISOString(),
        activityLog: [initialActivity],
      });
    });

    onImportOpportunities(importedOpps);
    setIsProcessing(false);
    setImportSummary(`Successfully imported ${importedOpps.length} opportunities into your logbook!`);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans"
    >
      <div className="bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-sepia-800 flex items-center justify-between bg-cream-50/70 dark:bg-sepia-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-readflow-green/15 dark:bg-readflow-lightgreen/20 text-readflow-green dark:text-readflow-lightgreen flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-sepia-850 dark:text-cream-50 flex items-center gap-2">
                Batch CSV / Excel Spreadsheet Import
              </h2>
              <p className="text-xs text-sepia-450 dark:text-sepia-400">
                Bulk upload existing leads, job applications, scholarships, or farm contacts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sepia-400 hover:text-sepia-800 dark:hover:text-cream-100 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File Upload Zone */}
          {!file ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cream-300 dark:border-sepia-700 hover:border-readflow-green dark:hover:border-readflow-lightgreen rounded-2xl p-8 text-center cursor-pointer transition-all bg-cream-50/40 dark:bg-sepia-850/30 hover:bg-cream-50 dark:hover:bg-sepia-850"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-cream-100 dark:bg-sepia-800 flex items-center justify-center text-readflow-green dark:text-readflow-lightgreen mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-sepia-850 dark:text-cream-100 mb-1">
                  Click to upload CSV or TSV file, or drag and drop
                </h3>
                <p className="text-xs text-sepia-450 max-w-sm mx-auto">
                  Supports comma, semicolon, and tab-delimited files exported from Google Sheets, Excel, Notion, or Airtable.
                </p>
              </div>

              {/* Sample Template Link */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Need an example spreadsheet structure before importing?</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV
                </button>
              </div>
            </div>
          ) : (
            /* File Loaded & Column Mapping Interface */
            <div className="space-y-5 animate-fadeIn">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-cream-50 dark:bg-sepia-850 border border-cream-200 dark:border-sepia-800 text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-readflow-green" />
                  <span className="font-bold text-sepia-850 dark:text-cream-100">{file.name}</span>
                  <span className="text-sepia-450 font-mono">({rawRows.length} rows detected)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setRawRows([]);
                    setCsvHeaders([]);
                  }}
                  className="text-xs text-sepia-450 hover:text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Choose Different File
                </button>
              </div>

              {/* Column Mapper Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-cream-200 dark:border-sepia-800 pb-2">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sepia-700 dark:text-cream-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-readflow-green" />
                    Map Spreadsheet Columns to Opportunity Fields
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-sepia-450">Fallback Category:</span>
                    <select
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="px-2 py-0.5 rounded border border-cream-200 dark:border-sepia-750 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 font-bold text-xs"
                    >
                      {Object.keys(CATEGORY_METADATA).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SYSTEM_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="p-3 rounded-xl bg-white dark:bg-sepia-900 border border-cream-200 dark:border-sepia-800 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-sepia-850 dark:text-cream-100 flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-rose-500 font-mono">*</span>}
                        </label>
                        {columnMapping[field.key] && (
                          <span className="text-[9px] font-mono text-readflow-green dark:text-readflow-lightgreen font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Mapped
                          </span>
                        )}
                      </div>

                      <select
                        value={columnMapping[field.key] || ''}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [field.key]: e.target.value })
                        }
                        className={`w-full px-2.5 py-1.5 text-xs rounded-lg border font-medium cursor-pointer outline-none transition-colors ${
                          columnMapping[field.key]
                            ? 'border-readflow-green/60 bg-cream-50/50 dark:bg-sepia-850 text-sepia-850 dark:text-cream-100'
                            : 'border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-450'
                        }`}
                      >
                        <option value="">(Do not import / Leave blank)</option>
                        {csvHeaders.map((header) => (
                          <option key={header} value={header}>
                            CSV: {header}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview (First 2 Rows) */}
              {rawRows.length > 0 && columnMapping.title && (
                <div className="space-y-2 pt-2 border-t border-cream-200 dark:border-sepia-800">
                  <h4 className="text-[11px] font-mono font-bold uppercase text-sepia-500">
                    Live Data Preview (First 2 Rows)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-cream-200 dark:border-sepia-800 bg-cream-50/30 dark:bg-sepia-850/30">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-100/70 dark:bg-sepia-800/60 font-mono text-[10px] text-sepia-600 dark:text-cream-300">
                        <tr>
                          <th className="p-2">Title</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Target Entity</th>
                          <th className="p-2">Expected Value</th>
                          <th className="p-2">Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-150 dark:divide-sepia-800">
                        {rawRows.slice(0, 2).map((row, idx) => {
                          const titleIdx = csvHeaders.indexOf(columnMapping.title);
                          const catIdx = columnMapping.category ? csvHeaders.indexOf(columnMapping.category) : -1;
                          const compIdx = columnMapping.companyOrClient ? csvHeaders.indexOf(columnMapping.companyOrClient) : -1;
                          const valIdx = columnMapping.expectedValue ? csvHeaders.indexOf(columnMapping.expectedValue) : -1;
                          const dlIdx = columnMapping.deadline ? csvHeaders.indexOf(columnMapping.deadline) : -1;

                          return (
                            <tr key={idx} className="hover:bg-cream-100/30 dark:hover:bg-sepia-800/30">
                              <td className="p-2 font-bold text-sepia-850 dark:text-cream-100">
                                {titleIdx >= 0 ? row[titleIdx] || '-' : '-'}
                              </td>
                              <td className="p-2 text-sepia-700 dark:text-cream-200">
                                {catIdx >= 0 && row[catIdx] ? row[catIdx] : defaultCategory}
                              </td>
                              <td className="p-2 text-sepia-700 dark:text-cream-200">
                                {compIdx >= 0 ? row[compIdx] || '-' : '-'}
                              </td>
                              <td className="p-2 text-emerald-700 dark:text-emerald-300 font-mono">
                                {valIdx >= 0 ? row[valIdx] || '-' : '-'}
                              </td>
                              <td className="p-2 font-mono text-sepia-500 dark:text-cream-300">
                                {dlIdx >= 0 ? row[dlIdx] || '-' : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importSummary && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSummary}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {file && (
          <div className="px-6 py-4 border-t border-cream-200 dark:border-sepia-800 flex items-center justify-between bg-cream-50/70 dark:bg-sepia-850">
            <span className="text-xs text-sepia-500 font-mono">
              Ready to import <strong>{rawRows.length}</strong> items
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-sepia-650 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-sepia-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing || !columnMapping.title || rawRows.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-readflow-green text-cream-50 hover:bg-readflow-olive disabled:opacity-50 transition-all cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                {isProcessing ? 'Importing Rows...' : `Import ${rawRows.length} Opportunities`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
