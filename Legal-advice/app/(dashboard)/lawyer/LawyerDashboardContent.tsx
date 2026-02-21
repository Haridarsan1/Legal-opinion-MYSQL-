'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Clock,
  AlertCircle,
  FileText,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Calendar,
  Folder,
  Star,
  Award,
  Eye,
  ArrowRight,
  User,
  Settings,
  Scale,
  Bell,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow, differenceInHours, format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import type { Profile } from '@/lib/types';

interface LegalRequest {
  id: string;
  request_number: string;
  title: string;
  department: string;
  status: string;
  created_at: string;
  client_id: string;
  sla_deadline?: string;
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  department_info?: {
    name: string;
  };
}

interface Props {
  profile: Profile | null;
  initialCases: LegalRequest[];
  averageRating: number;
  unreadMessages: number;
}

const STATUS_CONFIG = {
  assigned: {
    label: 'Pending Review',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    action: 'Review Case',
    urgent: false,
  },
  clarification_requested: {
    label: 'Clarification Required',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    action: 'Check Status',
    urgent: true,
  },
  in_review: {
    label: 'In Review',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    action: 'Continue Review',
    urgent: false,
  },
  opinion_ready: {
    label: 'Ready to Submit',
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    action: 'Submit Opinion',
    urgent: true,
  },
};

export default function LawyerDashboardContent({
  profile,
  initialCases,
  averageRating: initialRating,
  unreadMessages: initialUnread,
}: Props) {
  const router = useRouter();
  const [cases, setCases] = useState<LegalRequest[]>(initialCases);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [unreadMessages, setUnreadMessages] = useState(initialUnread);

  useEffect(() => {
    // TODO: Re-implement Realtime subscriptions with MySQL/socket.io
    /*
    // Real-time subscription for assigned cases
    const casesChannel = (await __getSupabaseClient()).channel('lawyer_cases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'legal_requests',
          filter: `assigned_lawyer_id=eq.${profile?.id}`,
        },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    // Real-time subscription for messages
    const messagesChannel = (await __getSupabaseClient()).channel('lawyer_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Real-time subscription for ratings
    const ratingsChannel = (await __getSupabaseClient()).channel('lawyer_ratings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lawyer_reviews',
          filter: `lawyer_id=eq.${profile?.id}`,
        },
        () => {
          fetchRating();
        }
      )
      .subscribe();

    return () => {
      casesChannel.unsubscribe();
      messagesChannel.unsubscribe();
      ratingsChannel.unsubscribe();
    };
    */
  }, [profile?.id]);

  const fetchCases = async () => {
    const { data } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                *,
                client:client_id(id, full_name, email, avatar_url),
                department_info:departments(name)
            `
      )
      .eq('assigned_lawyer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setCases(data);
  };

  const fetchUnreadCount = async () => {
    const { data: conversations } = await (await __getSupabaseClient()).from('conversations')
      .select('id')
      .or(`participant_1_id.eq.${profile?.id},participant_2_id.eq.${profile?.id}`);

    if (conversations) {
      const { count } = await (await __getSupabaseClient()).from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
        .neq('sender_id', profile?.id)
        .in(
          'conversation_id',
          conversations.map((c: any) => c.id)
        );

      setUnreadMessages(count || 0);
    }
  };

  const fetchRating = async () => {
    const { data: profileData } = await (await __getSupabaseClient()).from('profiles')
      .select('average_rating')
      .eq('id', profile?.id)
      .single();

    if (profileData) {
      setAverageRating(profileData.average_rating || 0);
    }
  };

  // Calculate workload metrics
  const workloadMetrics = useMemo(() => {
    const active = cases.filter((c: any) => !['completed', 'cancelled'].includes(c.status));
    const pendingReview = cases.filter((c: any) => c.status === 'assigned');
    const clarificationRequired = cases.filter((c: any) => c.status === 'clarification_requested');
    const completed = cases.filter((c: any) => c.status === 'completed');

    // Calculate SLA compliance
    const completedWithSLA = completed.filter((c: any) => {
      if (!c.sla_deadline) return true;
      return new Date(c.sla_deadline) >= new Date();
    });
    const slaCompliance =
      completed.length > 0 ? Math.round((completedWithSLA.length / completed.length) * 100) : 100;

    return {
      activeCases: active.length,
      pendingReview: pendingReview.length,
      clarificationRequired: clarificationRequired.length,
      opinionsDueToday: 0, // Would need SLA deadline logic
      slaCompliance,
      totalCompleted: completed.length,
    };
  }, [cases]);

  // Get attention-required items
  const attentionRequired = useMemo(() => {
    return cases
      .filter((c: any) => {
        if (c.status === 'assigned') return true;
        if (c.status === 'clarification_requested') return true;
        if (c.status === 'opinion_ready') return true;
        if (c.sla_deadline) {
          const hoursLeft = differenceInHours(new Date(c.sla_deadline), new Date());
          if (hoursLeft < 12 && hoursLeft > 0) return true;
        }
        return false;
      })
      .sort((a, b) => {
        // Sort by urgency
        const urgencyA = STATUS_CONFIG[a.status as keyof typeof STATUS_CONFIG]?.urgent ? 1 : 0;
        const urgencyB = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG]?.urgent ? 1 : 0;
        return urgencyB - urgencyA;
      })
      .slice(0, 3);
  }, [cases]);

  // Get active cases for workspace
  const activeCases = useMemo(() => {
    return cases.filter((c: any) => !['completed', 'cancelled'].includes(c.status)).slice(0, 5);
  }, [cases]);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full bg-slate-50">
      {/* Focus Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-slate-600">
              {attentionRequired.length > 0 ? (
                <>
                  You have{' '}
                  <span className="font-semibold text-amber-600">
                    {attentionRequired.length} {
                      attentionRequired.length === 1 ? 'case' : 'cases'}
                  </span>{' '}
                  requiring attention
                </>
              ) : (
                <>All cases are up to date</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/lawyer/requests"
              className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              View Assigned Cases
            </Link>
            <Link
              href="/lawyer/messages"
              className="relative px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadMessages}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Live Workload Snapshot */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Workload Snapshot</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/lawyer/requests?filter=active"
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {workloadMetrics.activeCases}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Active Cases</h3>
            <p className="text-xs text-slate-600">Currently assigned to you</p>
          </Link>

          <Link
            href="/lawyer/requests?status=assigned"
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {workloadMetrics.pendingReview}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Pending Review</h3>
            <p className="text-xs text-slate-600">Awaiting your analysis</p>
          </Link>

          <Link
            href="/lawyer/requests?status=clarification_requested"
            className="bg-white border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {workloadMetrics.clarificationRequired}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Clarification Required</h3>
            <p className="text-xs text-slate-600">Awaiting client response</p>
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {workloadMetrics.slaCompliance}%
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">SLA Compliance</h3>
            <p className="text-xs text-slate-600">On-time delivery rate</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {workloadMetrics.totalCompleted}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Completed</h3>
            <p className="text-xs text-slate-600">All-time opinions</p>
          </div>
        </div>
      </div>

      {/* Attention Required */}
      {
        attentionRequired.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Attention Required</h2>
            </div>
            <div className="grid gap-4">
              {attentionRequired.map((caseItem) => {
                const config = STATUS_CONFIG[caseItem.status as keyof typeof STATUS_CONFIG];
                const hoursLeft = caseItem.sla_deadline
                  ? differenceInHours(new Date(caseItem.sla_deadline), new Date())
                  : null;

                return (
                  <div
                    key={caseItem.id}
                    className={`bg-white border-2 ${config?.borderColor || 'border-slate-200'} rounded-2xl p-6 hover:shadow-lg transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {config?.urgent && (
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 mb-1">{caseItem.title}</h3>
                            <p className="text-sm text-slate-600">
                              {caseItem.request_number} • {caseItem.department}
                            </p>
                          </div>
                        </div>

                        {caseItem.client && (
                          <div className="flex items-center gap-2 mb-2">
                            {caseItem.client.avatar_url ? (
                              <Image
                                src={caseItem.client.avatar_url}
                                alt={caseItem.client.full_name}
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                            <span className="text-sm text-slate-600">
                              {caseItem.client.full_name}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 ${config?.bgColor} ${config?.textColor} text-xs font-semibold rounded-lg`}
                          >
                            {config?.label}
                          </span>
                          {hoursLeft !== null && hoursLeft < 12 && hoursLeft > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              SLA: {hoursLeft}h left
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/lawyer/review/${caseItem.id}`}
                        className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                        {config?.action || 'Review'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Active Cases Workspace & Performance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Cases */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Active Cases</h2>
            <Link
              href="/lawyer/requests"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeCases.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
              {activeCases.map((caseItem) => {
                const config = STATUS_CONFIG[caseItem.status as keyof typeof STATUS_CONFIG];

                return (
                  <Link
                    key={caseItem.id}
                    href={`/lawyer/review/${caseItem.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{caseItem.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {caseItem.request_number} • {caseItem.client?.full_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex px-2 py-0.5 ${config?.bgColor} ${config?.textColor} text-xs font-medium rounded`}
                        >
                          {config?.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(caseItem.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No active cases assigned</p>
            </div>
          )}
        </div>

        {/* Performance & Quick Tools */}
        <div className="space-y-6">
          {/* Performance */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-600">Average Rating</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-600">On-time Delivery</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {workloadMetrics.slaCompliance}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-600">Opinions Submitted</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {workloadMetrics.totalCompleted}
                </span>
              </div>

              <Link
                href="/lawyer/analytics"
                className="block w-full text-center px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm mt-4"
              >
                View Detailed Analytics
              </Link>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Tools</h2>
            <div className="grid gap-3">
              <Link
                href="/lawyer/repository"
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Folder className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">Document Repository</h3>
                  <p className="text-xs text-slate-600">Manage case files</p>
                </div>
              </Link>

              <Link
                href="/lawyer/profile"
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Settings className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">Update Profile</h3>
                  <p className="text-xs text-slate-600">Manage credentials</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
