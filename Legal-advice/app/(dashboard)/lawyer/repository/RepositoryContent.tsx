'use client';

import { useState } from 'react';
import { FileText, FolderOpen, FileCheck, Search, Upload, Filter, Grid, List } from 'lucide-react';
import OpinionsTab from './components/OpinionsTab';
import DraftsTab from './components/DraftsTab';
import TemplatesTab from './components/TemplatesTab';
import CaseDocsTab from './components/CaseDocsTab';
import ResearchTab from './components/ResearchTab';
import ComplianceTab from './components/ComplianceTab';

type TabType = 'opinions' | 'drafts' | 'templates' | 'cases' | 'research' | 'compliance';

interface Props {
  documents: {
    opinions: any[];
    drafts: any[];
    templates: any[];
    caseDocuments: any[];
    research: any[];
    compliance: any[];
  };
  stats: {
    totalOpinions: number;
    totalDrafts: number;
    totalTemplates: number;
    totalCaseDocuments: number;
    totalResearch: number;
    totalCompliance: number;
  };
  userId: string;
}

export default function RepositoryContent({ documents, stats, userId }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('opinions');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const tabs = [
    { id: 'opinions', label: 'My Opinions', icon: FileText, count: stats.totalOpinions },
    { id: 'drafts', label: 'Drafts', icon: FileCheck, count: stats.totalDrafts },
    { id: 'templates', label: 'Templates', icon: FolderOpen, count: stats.totalTemplates },
    { id: 'cases', label: 'Case Documents', icon: FileText, count: stats.totalCaseDocuments },
    { id: 'research', label: 'Research Library', icon: FileText, count: stats.totalResearch },
    { id: 'compliance', label: 'Compliance', icon: FileCheck, count: stats.totalCompliance },
  ];

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight mb-1">
            Document Repository
          </h1>
          <p className="text-slate-500 text-base">
            Manage your legal opinions, drafts, templates, and research materials
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {
  tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'opinions' && (
          <OpinionsTab
            documents={documents.opinions}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        )}
        {
  activeTab === 'drafts' && (
          <DraftsTab
            documents={documents.drafts}
            viewMode={viewMode}
            searchQuery={searchQuery}
            userId={userId}
          />
        )}
        {
  activeTab === 'templates' && (
          <TemplatesTab
            documents={documents.templates}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        )}
        {
  activeTab === 'cases' && (
          <CaseDocsTab
            documents={documents.caseDocuments}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        )}
        {
  activeTab === 'research' && (
          <ResearchTab
            documents={documents.research}
            viewMode={viewMode}
            searchQuery={searchQuery}
            userId={userId}
          />
        )}
        {
  activeTab === 'compliance' && (
          <ComplianceTab
            documents={documents.compliance}
            viewMode={viewMode}
            searchQuery={searchQuery}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
}
