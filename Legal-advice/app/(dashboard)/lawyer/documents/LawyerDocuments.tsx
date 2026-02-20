'use client';

import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import DocumentStats from './components/DocumentStats';
import DocumentFilters from './components/DocumentFilters';
import DocumentTable from './components/DocumentTable';
import EmptyState from './components/EmptyState';

interface Props {
  documents: any[];
  userId: string;
  lawyerProfile: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function LawyerDocuments({ documents, userId, lawyerProfile }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [caseFilter, setCaseFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Apply filters
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.request?.request_number?.toLowerCase().includes(searchLower) ||
      doc.request?.client?.full_name?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !doc.review_status) ||
      (statusFilter === 'reviewed' && doc.review_status === 'reviewed') ||
      (statusFilter === 'needs_clarification' && doc.review_status === 'needs_clarification');

    const matchesCase = caseFilter === 'all' || doc.request_id === caseFilter;

    return matchesSearch && matchesStatus && matchesCase;
  });

  // Calculate stats
  const stats = {
    total: documents.length,
    pending: documents.filter((d) => !d.review_status || d.review_status === 'pending').length,
    reviewed: documents.filter((d) => d.review_status === 'reviewed').length,
    needsClarification: documents.filter((d) => d.review_status === 'needs_clarification').length,
  };

  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FileText className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">Document Repository</h1>
              </div>
              <p className="text-slate-600 text-sm">
                Manage, review, and track documents across all assigned cases
              </p>
            </div>
          </div>

          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename, case ID, or client name..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <DocumentStats stats={stats} onFilterClick={setStatusFilter} activeFilter={statusFilter} />

        {/* Filters */}
        <DocumentFilters
          documents={documents}
          statusFilter={statusFilter}
          caseFilter={caseFilter}
          dateFilter={dateFilter}
          onStatusChange={setStatusFilter}
          onCaseChange={setCaseFilter}
          onDateChange={setDateFilter}
        />

        {/* Document Table */}
        {
  filteredDocuments.length > 0 ? (
          <DocumentTable
            documents={filteredDocuments}
            userId={userId}
            lawyerProfile={lawyerProfile}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
