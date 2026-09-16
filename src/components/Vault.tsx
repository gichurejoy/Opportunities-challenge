/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Opportunity } from '../types';
import { Search, Download, Upload, Trash2, SlidersHorizontal, Archive, RefreshCw, Edit2, Check, X, Building, FileSpreadsheet, Coins } from 'lucide-react';
import { CATEGORY_METADATA } from './QuickLogger';
import { FormattedText } from './FormattedText';

interface VaultProps {
  opportunities: Opportunity[];
  onImportVault: (data: any) => void;
  onClearVault: () => void;
  onDeleteOpportunity: (id: string) => void;
  onUpdateOpportunity: (opp: Opportunity) => void;
}

export const Vault: React.FC<VaultProps> = ({
  opportunities,
  onImportVault,
  onClearVault,
  onDeleteOpportunity,
  onUpdateOpportunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline edit states
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('');
  const [editPoints, setEditPoints] = useState<number>(0);
  const [editTimestamp, setEditTimestamp] = useState('');
  const [editCompanyOrClient, setEditCompanyOrClient] = useState('');
  const [editExpectedValue, setEditExpectedValue] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const ITEMS_PER_PAGE = 8;

  // Filter and Search
  const filteredOpps = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (opp.companyOrClient && opp.companyOrClient.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (opp.expectedValue && opp.expectedValue.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (opp.type && opp.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (opp.description && opp.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [opportunities, searchQuery, selectedCategory]);

  // Paginated list
  const paginatedOpps = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOpps.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOpps, currentPage]);

  const totalPages = Math.ceil(filteredOpps.length / ITEMS_PER_PAGE) || 1;

  // Export database as JSON file
  const handleExport = () => {
    const stateStr = localStorage.getItem('1000_opportunities_app_state');
    if (!stateStr) return;

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(stateStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', '1000_opportunities_vault_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export database as clean CSV spreadsheet
  const handleExportCSV = () => {
    if (opportunities.length === 0) {
      alert('No opportunities to export.');
      return;
    }

    const headers = [
      'Title',
      'Company / Client / Institution',
      'Expected Salary / Grant / Value',
      'Category',
      'Type',
      'Points',
      'Stage',
      'Date Logged',
      'Notes / Description'
    ];

    const rows = opportunities.map((opp) => [
      `"${(opp.title || '').replace(/"/g, '""')}"`,
      `"${(opp.companyOrClient || '').replace(/"/g, '""')}"`,
      `"${(opp.expectedValue || '').replace(/"/g, '""')}"`,
      `"${(opp.category || '').replace(/"/g, '""')}"`,
      `"${(opp.type || '').replace(/"/g, '""')}"`,
      opp.points || 0,
      `"${(opp.stage || 'Sourced').replace(/"/g, '""')}"`,
      `"${new Date(opp.timestamp).toLocaleDateString()}"`,
      `"${(opp.description || opp.feedback || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `1000_opportunities_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  // Import database from JSON file
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (parsed && Array.isArray(parsed.opportunities)) {
            onImportVault(parsed);
            alert('Backup restored successfully!');
            setCurrentPage(1);
          } else {
            alert('Invalid backup file. Could not find opportunity records.');
          }
        }
      } catch (err) {
        alert('Failed to parse the backup file. Ensure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
    // Reset file input value to trigger again if needed
    e.target.value = '';
  };

  return (
    <div id="vault-panel" className="bg-white dark:bg-sepia-900 rounded-2xl border border-cream-200 dark:border-sepia-800 p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-300">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-sepia-900 dark:text-cream-100 flex items-center gap-2">
              <Archive className="w-5 h-5 text-readflow-gold" />
              Opportunity History
            </h2>
            <p className="text-xs text-sepia-400 dark:text-sepia-500 mt-0.5 font-sans font-medium">
              Browse, search, and manage your complete historical opportunity records ({opportunities.length} total).
            </p>
          </div>

          {/* Export/Import/Clear controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              id="btn-import-vault"
              onClick={handleImportClick}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-cream-200 dark:border-sepia-800 hover:bg-cream-50 dark:hover:bg-sepia-850 transition-all text-sepia-700 dark:text-cream-200 cursor-pointer"
              title="Import JSON backup"
            >
              <Upload className="w-3.5 h-3.5 text-readflow-gold" />
              Import
            </button>
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-sm"
              title="Export as CSV spreadsheet for Excel / Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              Export CSV
            </button>
            <button
              id="btn-export-vault"
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-readflow-green hover:bg-readflow-green/90 dark:bg-readflow-olive dark:hover:bg-readflow-olive/90 text-cream-100 transition-all cursor-pointer shadow-sm"
              title="Export complete JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-cream-100" />
              Export JSON
            </button>
            <button
              id="btn-clear-vault"
              onClick={() => {
                if (window.confirm('Are you sure you want to restore all pre-seeded mock history? This will overwrite recent custom actions.')) {
                  onClearVault();
                  setCurrentPage(1);
                }
              }}
              className="p-1.5 text-sepia-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-cream-100 dark:border-sepia-800 transition-all cursor-pointer"
              title="Reset default mock database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters and search box */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-sepia-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="vault-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by action title, subtype, or description..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sepia-400" />
            <select
              id="vault-category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-cream-200 dark:border-sepia-800 bg-transparent text-sepia-700 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green dark:focus:ring-readflow-lightgreen cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-sepia-900">All Categories</option>
              {Object.keys(CATEGORY_METADATA).map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-sepia-900">{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results table list */}
        <div className="border border-cream-200 dark:border-sepia-800 rounded-xl overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto">
            <table id="vault-table" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-50 dark:bg-sepia-800/40 text-sepia-500 dark:text-sepia-400 font-bold border-b border-cream-200 dark:border-sepia-850">
                  <th className="p-3">Action</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Points</th>
                  <th className="p-3 text-right">Timestamp</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-sepia-800">
                {paginatedOpps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sepia-400 italic">
                      No matching opportunity records found. Try modifying filters or search query.
                    </td>
                  </tr>
                ) : (
                  paginatedOpps.map((opp) => {
                    const isEditing = editingOppId === opp.id;
                    const meta = CATEGORY_METADATA[opp.category] || CATEGORY_METADATA.Career;
                    const Icon = meta.icon;

                    if (isEditing) {
                      return (
                        <tr key={opp.id} className="bg-cream-50/70 dark:bg-sepia-800/20 border-l-2 border-readflow-green">
                          <td className="p-2">
                            <input
                              id={`vault-edit-title-${opp.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-cream-300 dark:border-sepia-700 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                              placeholder="Action title"
                            />
                            <input
                              id={`vault-edit-company-${opp.id}`}
                              type="text"
                              value={editCompanyOrClient}
                              onChange={(e) => setEditCompanyOrClient(e.target.value)}
                              className="w-full mt-1 px-2 py-0.5 text-[10px] rounded border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                              placeholder="Company/Client (optional)"
                            />
                            <input
                              id={`vault-edit-expected-value-${opp.id}`}
                              type="text"
                              value={editExpectedValue}
                              onChange={(e) => setEditExpectedValue(e.target.value)}
                              className="w-full mt-1 px-2 py-0.5 text-[10px] rounded border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                              placeholder="Expected salary/grant/value (optional)"
                            />
                            <textarea
                              id={`vault-edit-description-${opp.id}`}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full mt-1 px-2 py-0.5 text-[10px] rounded border border-cream-200 dark:border-sepia-800 bg-white dark:bg-sepia-900 text-sepia-850 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green resize-y font-sans"
                              placeholder="Job Description/Enquiry (optional)"
                              rows={1}
                            />
                          </td>
                          <td className="p-2">
                            <select
                              id={`vault-edit-category-${opp.id}`}
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-cream-300 dark:border-sepia-700 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-bold"
                            >
                              {Object.keys(CATEGORY_METADATA).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              id={`vault-edit-type-${opp.id}`}
                              type="text"
                              value={editType}
                              onChange={(e) => setEditType(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-cream-300 dark:border-sepia-700 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                              placeholder="Subtype"
                            />
                          </td>
                          <td className="p-2 w-20">
                            <input
                              id={`vault-edit-points-${opp.id}`}
                              type="number"
                              value={editPoints}
                              onChange={(e) => setEditPoints(Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs text-right font-mono font-bold rounded border border-cream-300 dark:border-sepia-700 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              id={`vault-edit-date-${opp.id}`}
                              type="date"
                              value={editTimestamp}
                              onChange={(e) => setEditTimestamp(e.target.value)}
                              className="px-2 py-1 text-xs rounded border border-cream-300 dark:border-sepia-700 bg-white dark:bg-sepia-900 text-sepia-800 dark:text-cream-100 focus:outline-none focus:ring-1 focus:ring-readflow-green cursor-pointer font-medium"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                id={`vault-save-btn-${opp.id}`}
                                onClick={() => {
                                  if (!editTitle.trim()) {
                                    alert('Action Title is required');
                                    return;
                                  }
                                  const timePart = opp.timestamp.includes('T') ? opp.timestamp.split('T')[1] : '12:00:00.000Z';
                                  const newTimestamp = editTimestamp ? `${editTimestamp}T${timePart}` : opp.timestamp;

                                  onUpdateOpportunity({
                                    ...opp,
                                    title: editTitle.trim(),
                                    category: editCategory,
                                    type: editType.trim(),
                                    points: editPoints,
                                    timestamp: newTimestamp,
                                    companyOrClient: editCompanyOrClient.trim() || undefined,
                                    expectedValue: editExpectedValue.trim() || undefined,
                                    description: editDescription.trim() || undefined,
                                  });
                                  setEditingOppId(null);
                                }}
                                className="text-cream-50 bg-readflow-green hover:bg-readflow-olive p-1.5 rounded transition-all cursor-pointer shadow-sm"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`vault-cancel-btn-${opp.id}`}
                                onClick={() => setEditingOppId(null)}
                                className="text-sepia-500 bg-cream-100 hover:bg-cream-200 dark:bg-sepia-850 dark:hover:bg-sepia-800 p-1.5 rounded transition-all cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={opp.id} className="hover:bg-cream-50/50 dark:hover:bg-sepia-800/10 transition-colors">
                        <td className="p-3 font-semibold text-sepia-800 dark:text-cream-100 max-w-[200px] truncate">
                          <div className="truncate" title={opp.title}>{opp.title}</div>
                          {opp.companyOrClient && (
                            <div className="mt-1 text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1 font-sans">
                              <Building className="w-3 h-3 text-amber-600 dark:text-amber-450 shrink-0" />
                              <span className="truncate max-w-[170px]" title={opp.companyOrClient}>
                                {opp.companyOrClient}
                              </span>
                            </div>
                          )}
                          {opp.expectedValue && (
                            <div className="mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 font-sans">
                              <Coins className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[170px]" title={opp.expectedValue}>
                                {opp.expectedValue}
                              </span>
                            </div>
                          )}
                          {opp.description && (
                            <div className="mt-1 text-[10px] text-sepia-650 dark:text-sepia-400 bg-cream-50/50 dark:bg-sepia-850/40 px-1.5 py-1 rounded border border-cream-100 dark:border-sepia-800/80 font-sans max-w-[180px] max-h-[60px] overflow-y-auto">
                              <FormattedText text={opp.description} />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 font-bold ${meta.text}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {opp.category}
                          </span>
                        </td>
                        <td className="p-3 text-sepia-400 dark:text-sepia-500 font-semibold">
                          {opp.type}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-sepia-800 dark:text-cream-100">
                          +{opp.points}
                        </td>
                        <td className="p-3 text-right text-sepia-400 dark:text-sepia-500 font-medium">
                          {new Date(opp.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              id={`vault-edit-btn-${opp.id}`}
                              onClick={() => {
                                setEditingOppId(opp.id);
                                setEditTitle(opp.title);
                                setEditCategory(opp.category);
                                setEditType(opp.type);
                                setEditPoints(opp.points);
                                setEditTimestamp(opp.timestamp.substring(0, 10));
                                setEditCompanyOrClient(opp.companyOrClient || '');
                                setEditExpectedValue(opp.expectedValue || '');
                                setEditDescription(opp.description || '');
                              }}
                              className="text-sepia-400 hover:text-readflow-green p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`vault-del-btn-${opp.id}`}
                              onClick={() => onDeleteOpportunity(opp.id)}
                              className="text-sepia-300 hover:text-red-500 p-1 rounded hover:bg-cream-100 dark:hover:bg-sepia-800 transition-all cursor-pointer"
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
        </div>
      </div>

      {/* Pagination indicators */}
      <div className="flex items-center justify-between text-xs text-sepia-450 dark:text-sepia-500 pt-4 border-t border-cream-100 dark:border-sepia-800 mt-4">
        <span className="font-medium">
          Showing {filteredOpps.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredOpps.length)} of {filteredOpps.length} records
        </span>
        <div className="flex items-center gap-2">
          <button
            id="vault-prev-page"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-2.5 py-1 rounded-lg border border-cream-200 dark:border-sepia-800 text-sepia-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-sepia-850 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer font-bold"
          >
            Prev
          </button>
          <span className="font-bold text-sepia-700 dark:text-cream-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            id="vault-next-page"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-2.5 py-1 rounded-lg border border-cream-200 dark:border-sepia-800 text-sepia-700 dark:text-cream-200 hover:bg-cream-50 dark:hover:bg-sepia-850 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
