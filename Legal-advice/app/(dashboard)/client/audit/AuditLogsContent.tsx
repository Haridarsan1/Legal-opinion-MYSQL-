'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Calendar,
  ChevronDown,
  Shield,
  FileText,
  Upload,
  Eye,
  MessageCircle,
  Scale,
  CheckCircle,
  XCircle,
  ChevronUp,
  Globe,
  Smartphone,
  Clock,
} from 'lucide-react';
import {
  formatDistanceToNow,
  format,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
} from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  request?: {
    title?: string;
    request_number: string;
  };
}

interface Props {
  logs: AuditLog[];
}

// Category configuration with icons and colors
const CATEGORIES = {
  security: {
    label: 'Security',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    actions: ['login', 'logout', 'password_change', 'password_reset', 'account_update'],
  },
  requests: {
    label: 'Requests',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    actions: ['request_created', 'request_updated', 'request_cancelled', 'request_submitted'],
  },
  documents: {
    label: 'Documents',
    icon: Upload,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    actions: ['document_uploaded', 'document_downloaded', 'document_viewed', 'document_deleted'],
  },
  opinions: {
    label: 'Opinions',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    actions: ['opinion_submitted', 'opinion_viewed', 'opinion_downloaded', 'opinion_received'],
  },
  messages: {
    label: 'Messages',
    icon: MessageCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    actions: ['message_sent', 'message_received', 'conversation_created'],
  },
};

// Human-friendly action titles
const ACTION_TITLES: Record<string, string> = {
  login: 'Login Successful',
  logout: 'Logged Out',
  password_change: 'Password Changed',
  password_reset: 'Password Reset',
  account_update: 'Account Updated',
  request_created: 'New Request Created',
  request_updated: 'Request Updated',
  request_cancelled: 'Request Cancelled',
  request_submitted: 'Request Submitted',
  document_uploaded: 'Document Uploaded',
  document_downloaded: 'Document Downloaded',
  document_viewed: 'Document Viewed',
  document_deleted: '   Deleted',
  opinion_submitted: 'Opinion Submitted',
  opinion_viewed: 'Opinion Viewed',
  opinion_downloaded: 'Opinion Downloaded',
  opinion_received: 'Opinion Received',
  message_sent: 'Message Sent',
  message_received: 'Message Received',
  conversation_created: 'Conversation Started',
};

export default function AuditLogsContent({ logs: initialLogs }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'7' | '30' | 'all'>('30');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Get category for an action
  const getCategory = (action: string) => {
    for (const [key, config] of Object.entries(CATEGORIES)) {
      if (config.actions.includes(action)) {
        return { key, ...config };
      }
    }
    return null;
  };

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let filtered = [...initialLogs];

    // Date range filter
    if (dateRange !== 'all') {
      const cutoffDate = subDays(new Date(), parseInt(dateRange));
      filtered = filtered.filter((log) => isAfter(new Date(log.created_at), cutoffDate));
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const categoryConfig = CATEGORIES[categoryFilter as keyof typeof CATEGORIES];
      if (categoryConfig) {
        filtered = filtered.filter((log) => categoryConfig.actions.includes(log.action));
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) => {
        const actionTitle = ACTION_TITLES[log.action]?.toLowerCase() || '';
        const requestNumber = log.request?.request_number?.toLowerCase() || '';
        const details = JSON.stringify(log.details || {}).toLowerCase();

        return (
          actionTitle.includes(query) ||
          requestNumber.includes(query) ||
          log.action.includes(query) ||
          details.includes(query)
        );
      });
    }

    return filtered;
  }, [initialLogs, dateRange, categoryFilter, searchQuery]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, AuditLog[]> = {};

    filteredLogs.forEach((log) => {
      const dateKey = format(new Date(log.created_at), 'MMMM dd, yyyy');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return groups;
  }, [filteredLogs]);

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Action', 'Details', 'IP Address'];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      ACTION_TITLES[log.action] || log.action,
      JSON.stringify(log.details || {}),
      log.ip_address || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateRange('30');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery || dateRange !== '30' || categoryFilter !== 'all';

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Track your activity, document actions, and security events in one place
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
          title="Download your activity history"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity by case, document, or action..."
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Range Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 bg-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {dateRange === '7' && 'Last 7 days'}
                  {
  dateRange === '30' && 'Last 30 days'}
                  {
  dateRange === 'all' && 'All time'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDateDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {[
                    { value: '7', label: 'Last 7 days' },
                    { value: '30', label: 'Last 30 days' },
                    { value: 'all', label: 'All time' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateRange(option.value as any);
                        setShowDateDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                        dateRange === option.value
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Type Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowDateDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 bg-white transition-colors"
              >
                <span>
                  {categoryFilter === 'all'
                    ? 'All Activity'
                    : CATEGORIES[categoryFilter as keyof typeof CATEGORIES]?.label}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors ${
                      categoryFilter === 'all'
                        ? 'bg-primary/5 text-primary font-medium'
                        : 'text-slate-700'
                    }`}
                  >
                    All Activity
                  </button>
                  {Object.entries(CATEGORIES).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setCategoryFilter(key);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                          categoryFilter === key
                            ? 'bg-primary/5 text-primary font-medium'
                            : 'text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-sl600 hover:text-slate-900 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      {Object.keys(groupedLogs).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery || hasActiveFilters ? 'No matching activity' : 'No activity yet'}
          </h3>
          <p className="text-slate-600 text-sm">
            {searchQuery || hasActiveFilters
              ? 'Try adjusting your filters or search terms'
              : 'Your account activity will appear here as you use the platform'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div
              key={date}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Date Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">{date}</h3>
              </div>

              {/* Events */}
              <div className="divide-y divide-slate-100">
                {dayLogs.map((log) => {
                  const category = getCategory(log.action);
                  const Icon = category?.icon || FileText;
                  const isExpanded = expandedLogs.has(log.id);
                  const hasDetails = log.ip_address || log.user_agent;

                  return (
                    <div key={log.id} className="px-6 py-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Icon with colored background */}
                        <div
                          className={`p-3 rounded-xl ${category?.bgColor || 'bg-slate-100'} flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${category?.color || 'text-slate-600'}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {ACTION_TITLES[log.action] || log.action}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">
                                {log.details?.description || `Action: ${log.action}`}
                                {
  log.request && ` • ${log.request.request_number}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className="text-sm text-slate-500"
                                title={format(new Date(log.created_at), 'PPpp')}
                              >
                                {format(new Date(log.created_at), 'h:mm a')}
                              </span>
                              {hasDetails && (
                                <button
                                  onClick={() => toggleExpanded(log.id)}
                                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-600" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Category Badge */}
                          {
  category && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${category.bgColor} ${category.color} border ${category.borderColor}`}
                            >
                              {category.label}
                            </span>
                          )}

                          {/* Expandable Details */}
                          {
  isExpanded && hasDetails && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              {log.ip_address && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">IP Address:</span>
                                  <span className="font-mono text-slate-900">{log.ip_address}</span>
                                </div>
                              )}
                              {
  log.user_agent && (
                                <div className="flex items-start gap-2 text-sm">
                                  <Smartphone className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <div>
                                    <span className="text-slate-600">Device:</span>
                                    <p className="font-mono text-xs text-slate-700 mt-1">
                                      {log.user_agent}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
