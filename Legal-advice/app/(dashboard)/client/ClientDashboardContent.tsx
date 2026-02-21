'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  Clock,
  Scale,
  CheckCircle,
  MessageCircle,
  Users,
  Building2,
  Star,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Bell,
  Eye,
  Award,
  Briefcase,
  Calendar,
} from 'lucide-react';

import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import type { Profile } from '@/lib/types';
import {
  type LifecycleSummary,
  type LifecycleStatus,
} from '@/app/domain/lifecycle/LifecycleResolver';
import { getClientDashboardSummaries } from '@/app/actions/client';

interface Activity {
  id: string;
  type:
  | 'request_created'
  | 'message_received'
  | 'opinion_submitted'
  | 'clarification_requested'
  | 'status_updated';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
  icon: any;
}

interface Props {
  profile: Profile | null;
  initialData: LifecycleSummary[];
  unreadMessages: number;
  marketplaceMetrics?: {
    activePublicRequests: number;
    totalProposalsReceived: number;
    pendingDecisions: number;
  } | null;
}

const STATUS_CONFIG: Partial<
  Record<
    LifecycleStatus,
    {
      label: string;
      color: string;
      bgColor: string;
      textColor: string;
      borderColor: string;
      icon: any;
      description: string;
    }
  >
> = {
  draft: {
    label: 'Draft',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    icon: FileText,
    description: 'Not submitted yet',
  },
  submitted: {
    label: 'Submitted',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: FileText,
    description: 'Awaiting lawyer assignment',
  },
  marketplace_posted: {
    label: 'Marketplace',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: Building2,
    description: 'Posted to lawyer marketplace',
  },
  claimed: {
    label: 'Claimed',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: Users,
    description: 'Lawyer has claimed your case',
  },
  assigned: {
    label: 'Assigned',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: Users,
    description: 'Lawyer reviewing your case',
  },
  clarification_pending: {
    label: 'Action Required',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: AlertCircle,
    description: 'Response required from you',
  },
  in_review: {
    label: 'In Review',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    icon: Scale,
    description: 'Legal analysis in progress',
  },
  opinion_ready: {
    label: 'Opinion Ready',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    description: 'Opinion available to download',
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    description: 'Opinion viewed',
  },
  completed: {
    label: 'Completed',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    icon: CheckCircle,
    description: 'Case closed',
  },
  archived: {
    label: 'Archived',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-200',
    icon: FileText,
    description: 'Archived case',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    description: 'Case cancelled',
  },
};

export default function ClientDashboardContent({
  profile,
  initialData,
  unreadMessages: initialUnreadMessages,
  marketplaceMetrics,
}: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState<LifecycleSummary[]>(initialData);
  const [unreadMessages, setUnreadMessages] = useState(initialUnreadMessages);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Real-time subscriptions disabled during MySQL/Prisma migration
    // TODO: Implement alternative real-time solution
    fetchActivities();
  }, [profile?.id]);

  const fetchRequests = async () => {
    const result = await getClientDashboardSummaries();
    if (result.success && result.data) {
      setRequests(result.data);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/client/messages/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchActivities = async () => {
    // Create mock activities based on requests. Ideally this comes from audit logs.
    const recentActivities: Activity[] = requests.slice(0, 5).map((request) => ({
      id: request.id,
      type: 'status_updated',
      title:
        request.lifecycleState === 'opinion_ready'
          ? 'Opinion submitted'
          : `Request ${STATUS_CONFIG[request.lifecycleState]?.label || 'Updated'}`,
      description: `${request.title} • ${request.request_number}`,
      timestamp: request.created_at, // Ideally updated_at
      link: `/client/track/${request.id}`, // Fixed link
      icon: STATUS_CONFIG[request.lifecycleState]?.icon || FileText,
    }));

    setActivities(recentActivities);
  };

  // Calculate status summaries
  const statusSummary = {
    submitted: requests.filter((r: any) => r.lifecycleState === 'submitted').length,
    assigned: requests.filter((r: any) => r.lifecycleState === 'assigned').length,
    awaiting_action: requests.filter((r: any) => r.lifecycleState === 'clarification_pending').length,
    in_review: requests.filter((r: any) => r.lifecycleState === 'in_review').length,
    opinion_ready: requests.filter((r: any) => ['opinion_ready', 'delivered'].includes(r.lifecycleState))
      .length,
    completed: requests.filter((r: any) =>
      ['completed', 'archived', 'cancelled'].includes(r.lifecycleState)
    ).length,
  };

  // Get active requests (not terminal)
  const activeRequests = requests.filter((r: any) => !r.meta?.isTerminal).slice(0, 3);

  // Get first name
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const hasRequests = requests.length > 0;

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 w-full">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Welcome back, {firstName}! 👋</h1>
            <p className="text-white/90 text-base sm:text-lg mb-6">
              Track your legal requests and stay updated in real-time
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/client/new-request"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create New Request
              </Link>
              {hasRequests && (
                <>
                  <Link
                    href="/client/messages"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur"
                  >
                    <MessageCircle className="w-5 h-5" />
                    View Messages
                    {unreadMessages > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/client/track"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur"
                  >
                    <Eye className="w-5 h-5" />
                    Track Requests
                  </Link>
                </>
              )}
            </div>
          </div>

          {hasRequests && (
            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Your Progress</span>
              </div>
              <div className="text-3xl font-bold">{requests.length}</div>
              <div className="text-white/70 text-sm">Total Requests</div>
            </div>
          )}
        </div>
      </div>

      {hasRequests && marketplaceMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Public Requests</p>
              <p className="text-xl font-bold text-slate-900">
                {marketplaceMetrics.activePublicRequests}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Proposals Received</p>
              <p className="text-xl font-bold text-slate-900">
                {marketplaceMetrics.totalProposalsReceived}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Decisions</p>
              <p className="text-xl font-bold text-slate-900">
                {marketplaceMetrics.pendingDecisions}
              </p>
            </div>
          </div>
        </div>
      )}

      {
        hasRequests ? (
          <>
            {/* Live Status Overview */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Live Status Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {Object.entries({
                  submitted: { count: statusSummary.submitted, key: 'submitted' },
                  assigned: { count: statusSummary.assigned, key: 'assigned' },
                  awaiting_action: {
                    count: statusSummary.awaiting_action,
                    key: 'clarification_pending',
                  },
                  in_review: { count: statusSummary.in_review, key: 'in_review' },
                  opinion_ready: { count: statusSummary.opinion_ready, key: 'opinion_ready' },
                  completed: { count: statusSummary.completed, key: 'completed' },
                }).map(([statusKey, { count, key }]) => {
                  const config =
                    STATUS_CONFIG[key as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.submitted;
                  const Icon = config ? config.icon : FileText;

                  return (
                    <Link
                      key={statusKey}
                      href={`/client/track?status=${key}`}
                      className={`${config?.bgColor} border ${config?.borderColor} rounded-2xl p-4 hover:shadow-lg transition-all cursor-pointer group`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 ${config?.bgColor} rounded-lg`}>
                          <Icon className={`w-5 h-5 ${config?.textColor}`} />
                        </div>
                        {count > 0 && (
                          <span className={`text-2xl font-bold ${config?.textColor}`}>{count}</span>
                        )}
                      </div>
                      <h3 className={`font-semibold ${config?.textColor} mb-1`}>{config?.label}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {count === 0 ? 'No cases' : config?.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Active Requests */}
            {
              activeRequests.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Active Requests</h2>
                    <Link
                      href="/client/track"
                      className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      View all
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid gap-4">
                    {activeRequests.map((request) => {
                      const config =
                        STATUS_CONFIG[request.lifecycleState as keyof typeof STATUS_CONFIG] ||
                        STATUS_CONFIG.submitted;
                      const StatusIcon = config?.icon || FileText;

                      return (
                        <div
                          key={request.id}
                          className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 ${config?.bgColor} rounded-lg mt-1`}>
                                  <StatusIcon className={`w-5 h-5 ${config?.textColor}`} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-slate-900 mb-1">
                                    {request.title || request.request_number}
                                  </h3>
                                  <p className="text-sm text-slate-600">
                                    {request.request_number} •{' '}
                                    {
                                      request.department?.name || 'Legal Request'}
                                  </p>
                                </div>
                              </div>

                              {request.lawyer && (
                                <div className="flex items-center gap-2 mb-3">
                                  {request.lawyer.avatar_url ? (
                                    <Image
                                      src={request.lawyer.avatar_url}
                                      alt={request.lawyer.full_name}
                                      width={24}
                                      height={24}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                      {request.lawyer.full_name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm text-slate-600">
                                    Assigned to {request.lawyer.full_name}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 ${config?.bgColor} ${config?.textColor} text-xs font-semibold rounded-lg`}
                                >
                                  {config?.label}
                                </span>
                                <span className="text-xs text-slate-500" suppressHydrationWarning>
                                  {formatDistanceToNow(new Date(request.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/client/track/${request.id}`}
                              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-2"
                            >
                              {request.lifecycleState === 'clarification_pending' && 'Respond Now'}
                              {
                                request.lifecycleState === 'opinion_ready' && 'Download Opinion'}
                              {!['clarification_pending', 'opinion_ready'].includes(
                                request.lifecycleState
                              ) && 'View Details'}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Activity & Updates */}
            {
              activities.length > 0 && (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
                    <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                      {activities.slice(0, 5).map((activity, index) => {
                        const ActivityIcon = activity.icon;

                        return (
                          <Link
                            key={`${activity.id}-${index}`}
                            href={activity.link || '/client/track'}
                            className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="p-2 bg-slate-100 rounded-lg">
                              <ActivityIcon className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 mb-1">{activity.title}</p>
                              <p className="text-sm text-slate-600 mb-1">{activity.description}</p>
                              <p className="text-xs text-slate-500" suppressHydrationWarning>
                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Navigation */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid gap-3">
                      <Link
                        href="/client/lawyers"
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-slate-900">Find a Lawyer</h3>
                        </div>
                        <p className="text-sm text-slate-600">Browse verified legal professionals</p>
                      </Link>

                      <Link
                        href="/client/departments"
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-semibold text-slate-900">Legal Departments</h3>
                        </div>
                        <p className="text-sm text-slate-600">Explore practice areas</p>
                      </Link>

                      <Link
                        href="/client/ratings"
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-50 rounded-lg">
                            <Star className="w-5 h-5 text-amber-600" />
                          </div>
                          <h3 className="font-semibold text-slate-900">Rate & Review</h3>
                        </div>
                        <p className="text-sm text-slate-600">Share your experience</p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </>
        ) : (
          /* Empty / First-Time User State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 max-w-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                You haven't created a legal request yet
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                Start by choosing a legal department or browsing lawyers to get expert legal opinions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/client/new-request"
                  className="inline-flex items-center justify-center gap-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create New Request
                </Link>
                <Link
                  href="/client/departments"
                  className="inline-flex items-center justify-center gap-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <Building2 className="w-5 h-5" />
                  Browse Departments
                </Link>
              </div>

              {/* Quick Guide */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">How it works</h3>
                <div className="grid sm:grid-cols-3 gap-6 text-left">
                  <div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold mb-3">
                      1
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">Submit Request</h4>
                    <p className="text-sm text-slate-600">
                      Choose a department and describe your legal query
                    </p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold mb-3">
                      2
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">Get Matched</h4>
                    <p className="text-sm text-slate-600">
                      We assign a qualified lawyer to review your case
                    </p>
                  </div>
                  <div>
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold mb-3">
                      3
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">Receive Opinion</h4>
                    <p className="text-sm text-slate-600">
                      Download your expert legal opinion within days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

