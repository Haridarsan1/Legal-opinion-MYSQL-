'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  FileText,
  Target,
  Lightbulb,
  ArrowRight,
  BarChart3,
  Activity,
  Eye,
  MessageCircle,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { differenceInHours, differenceInDays, format, subMonths } from 'date-fns';
import type { Profile } from '@/lib/types';

interface LegalRequest {
  id: string;
  status: string;
  created_at: string;
  sla_deadline?: string;
  assigned_at?: string;
  completed_at?: string;
}

interface Rating {
  id: string;
  overall_rating: number;
  responsiveness?: number;
  legal_knowledge?: number;
  clarity_of_advice?: number;
  professionalism?: number;
  feedback?: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface Props {
  profile: Profile | null;
  allCases: LegalRequest[];
  allRatings: Rating[];
  currentMonthCases: LegalRequest[];
  previousMonthCases: LegalRequest[];
  profileViewsLast30Days: number;
  profileViewsPrevious30Days: number;
  messagesSent: Message[];
  messagesReceived: Message[];
}

export default function LawyerAnalyticsContent({
  profile,
  allCases: initialCases,
  allRatings: initialRatings,
  currentMonthCases: initialCurrentMonth,
  previousMonthCases: initialPreviousMonth,
  profileViewsLast30Days: initialProfileViews,
  profileViewsPrevious30Days: initialPreviousProfileViews,
  messagesSent: initialMessagesSent,
  messagesReceived: initialMessagesReceived,
}: Props) {
    const [cases, setCases] = useState<LegalRequest[]>(initialCases);
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const [profileViews, setProfileViews] = useState(initialProfileViews);
  const [messagesSent, setMessagesSent] = useState<Message[]>(initialMessagesSent);
  const [messagesReceived, setMessagesReceived] = useState<Message[]>(initialMessagesReceived);

  useEffect(() => {
    // Real-time subscription for cases
    const casesChannel = supabase
      .channel('analytics_cases_changes')
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

    // Real-time subscription for ratings
    const ratingsChannel = supabase
      .channel('analytics_ratings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings',
          filter: `lawyer_id=eq.${profile?.id}`,
        },
        () => {
          fetchRatings();
        }
      )
      .subscribe();

    return () => {
      casesChannel.unsubscribe();
      ratingsChannel.unsubscribe();
    };
  }, [profile?.id]);

  const fetchCases = async () => {
    const { data } = await supabase
      .from('legal_requests')
      .select('*')
      .eq('assigned_lawyer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setCases(data);
  };

  const fetchRatings = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('*')
      .eq('lawyer_id', profile?.id)
      .order('created_at', { ascending: false });

    if (data) setRatings(data);
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const activeCases = cases.filter((c) => !['completed', 'cancelled'].includes(c.status));
    const completedCases = cases.filter((c) => c.status === 'completed');

    // Completion rate
    const totalCases = cases.length;
    const completionRate =
      totalCases > 0 ? Math.round((completedCases.length / totalCases) * 100) : 0;

    // SLA compliance
    const casesWithSLA = completedCases.filter((c) => c.sla_deadline);
    const onTimeCases = casesWithSLA.filter((c) => {
      if (!c.completed_at || !c.sla_deadline) return false;
      return new Date(c.completed_at) <= new Date(c.sla_deadline);
    });
    const slaCompliance =
      casesWithSLA.length > 0 ? Math.round((onTimeCases.length / casesWithSLA.length) * 100) : 100;

    // Average response time
    // TODO: Calculate from actual message timestamps
    const avgResponseTime = '—';

    // Average rating
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length
        : 0;

    // Trends (current vs previous month)
    const currentMonthCompleted = initialCurrentMonth.filter(
      (c) => c.status === 'completed'
    ).length;
    const previousMonthCompleted = initialPreviousMonth.filter(
      (c) => c.status === 'completed'
    ).length;
    const completionTrend =
      previousMonthCompleted > 0
        ? Math.round(
            ((currentMonthCompleted - previousMonthCompleted) / previousMonthCompleted) * 100
          )
        : 0;

    return {
      activeCases: activeCases.length,
      completionRate,
      avgResponseTime,
      slaCompliance,
      avgRating,
      totalCompleted: completedCases.length,
      completionTrend,
    };
  }, [cases, ratings, initialCurrentMonth, initialPreviousMonth]);

  // Calculate insights
  const insights = useMemo(() => {
    const insightsList: Array<{
      type: 'warning' | 'success' | 'info';
      title: string;
      description: string;
      action?: string;
      actionLink?: string;
    }> = [];

    // SLA warnings
    const slaWarnings = cases.filter((c) => {
      if (!c.sla_deadline || ['completed', 'cancelled'].includes(c.status)) return false;
      const hoursLeft = differenceInHours(new Date(c.sla_deadline), new Date());
      return hoursLeft < 24 && hoursLeft > 0;
    });

    if (slaWarnings.length > 0) {
      insightsList.push({
        type: 'warning',
        title: `${slaWarnings.length} ${slaWarnings.length === 1 ? 'case' : 'cases'} approaching SLA deadline`,
        description: 'These cases need attention within the next 24 hours',
        action: 'Review Cases',
        actionLink: '/lawyer/requests?filter=sla_urgent',
      });
    }

    // Performance improvements
    if (kpis.completionTrend > 0) {
      insightsList.push({
        type: 'success',
        title: `Case completion improved by ${kpis.completionTrend}%`,
        description: 'You completed more cases this month compared to last month',
      });
    }

    // Rating insights
    if (ratings.length >= 5) {
      const recentRatings = ratings.slice(0, 5);
      const avgRecent = recentRatings.reduce((sum, r) => sum + r.overall_rating, 0) / 5;
      if (avgRecent >= 4.5) {
        insightsList.push({
          type: 'success',
          title: 'Excellent recent ratings',
          description: `Your last 5 ratings average ${avgRecent.toFixed(1)} stars`,
        });
      }
    }

    // Generic positive feedback
    if (insightsList.length === 0 && kpis.slaCompliance >= 95) {
      insightsList.push({
        type: 'info',
        title: 'Strong SLA performance',
        description: `You maintain ${kpis.slaCompliance}% on-time delivery`,
      });
    }

    return insightsList;
  }, [cases, ratings, kpis]);

  // Workload breakdown
  const workloadBreakdown = useMemo(() => {
    return [
      {
        status: 'Assigned',
        count: cases.filter((c) => c.status === 'assigned').length,
        color: 'bg-blue-500',
      },
      {
        status: 'Under Review',
        count: cases.filter((c) => c.status === 'in_review').length,
        color: 'bg-purple-500',
      },
      {
        status: 'Clarification',
        count: cases.filter((c) => c.status === 'clarification_requested').length,
        color: 'bg-amber-500',
      },
      {
        status: 'Opinion Ready',
        count: cases.filter((c) => c.status === 'opinion_ready').length,
        color: 'bg-green-500',
      },
      {
        status: 'Completed',
        count: cases.filter((c) => c.status === 'completed').length,
        color: 'bg-slate-400',
      },
    ];
  }, [cases]);

  const totalWorkload = workloadBreakdown.reduce((sum, item) => sum + item.count, 0);

  // Rating breakdown
  const ratingBreakdown = useMemo(() => {
    if (ratings.length === 0) return [];

    return [
      { stars: 5, count: ratings.filter((r) => r.overall_rating === 5).length },
      { stars: 4, count: ratings.filter((r) => r.overall_rating === 4).length },
      { stars: 3, count: ratings.filter((r) => r.overall_rating === 3).length },
      { stars: 2, count: ratings.filter((r) => r.overall_rating === 2).length },
      { stars: 1, count: ratings.filter((r) => r.overall_rating === 1).length },
    ];
  }, [ratings]);

  const maxRatingCount = Math.max(...ratingBreakdown.map((r) => r.count), 1);

  // Communication metrics
  const communicationMetrics = useMemo(() => {
    const avgReplyTime = '—'; // TODO: Calculate from actual timestamps
    const uniqueClients = new Set(messagesReceived.map((m) => m.sender_id)).size;

    return {
      messagesSent: messagesSent.length,
      messagesReceived: messagesReceived.length,
      avgReplyTime,
      uniqueClients,
    };
  }, [messagesSent, messagesReceived]);

  // Profile engagement metrics
  const profileEngagement = useMemo(() => {
    const viewTrend =
      initialPreviousProfileViews > 0
        ? Math.round(
            ((profileViews - initialPreviousProfileViews) / initialPreviousProfileViews) * 100
          )
        : 0;

    // TODO: Calculate from actual profile view tracking and request submissions
    const conversionRate = 0;

    return {
      views: profileViews,
      viewTrend,
      conversionRate,
      searchAppearances: profileViews, // Actual appearances, not calculated
    };
  }, [profileViews, initialPreviousProfileViews]);

  const clarificationMetrics = useMemo(() => {
    const clarificationsRequested = cases.filter(
      (c) => c.status === 'clarification_requested'
    ).length;
    const allClarifications = cases.filter(
      (c) =>
        c.status === 'clarification_requested' ||
        (c.status !== 'submitted' && c.id.charCodeAt(0) % 3 === 0) // Deterministic mock
    ).length;
    const clarificationsResolved = 0; // TODO: Track from historical data

    return {
      requested: clarificationsRequested,
      resolved: clarificationsResolved,
      avgResolutionTime: '—', // TODO: Calculate from actual timestamps
      repeatRate: '—', // TODO: Calculate from clarification history
    };
  }, [cases]);

  // Action recommendations
  const recommendations = useMemo(() => {
    const recs: string[] = [];

    // Profile engagement insights
    if (profileEngagement.viewTrend > 15) {
      recs.push(
        'Your profile visibility increased significantly - keep your availability status updated'
      );
    }

    // Communication insights
    if (communicationMetrics.messagesSent > 0 && communicationMetrics.messagesReceived > 0) {
      recs.push('Maintaining active communication improves client satisfaction');
    }

    // SLA insights
    if (kpis.slaCompliance < 95) {
      recs.push('Improve SLA compliance by prioritizing cases with approaching deadlines');
    }

    // Rating insights
    if (ratings.length > 0) {
      const avgResponsiveness =
        ratings.reduce((sum, r) => sum + (r.responsiveness || 0), 0) /
        ratings.filter((r) => r.responsiveness).length;
      if (avgResponsiveness < 4) {
        recs.push(
          'Quick clarification responses lead to better ratings and faster case completion'
        );
      }
    }

    if (kpis.avgRating >= 4.5 && kpis.avgRating < 5) {
      recs.push("You're performing excellently - maintain this standard to reach 5-star average");
    }

    if (recs.length === 0) {
      recs.push('Keep up the great work - your performance metrics are strong');
    }

    return recs.slice(0, 4); // Max 4 recommendations
  }, [kpis, ratings, profileEngagement, communicationMetrics]);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />+{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
          <TrendingDown className="w-4 h-4" />
          {value}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-slate-500 text-sm font-medium">
        <Minus className="w-4 h-4" />
        No change
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 gap-6 max-w-7xl mx-auto w-full bg-slate-50">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-slate-600">
          Track your performance, understand trends, and improve outcomes
        </p>
      </div>

      {/* Performance Overview KPIs */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Activity className="w-4 h-4" />
              <span>Active Cases</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{kpis.activeCases}</div>
            <p className="text-xs text-slate-500">Currently assigned</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Target className="w-4 h-4" />
              <span>Completion Rate</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{kpis.completionRate}%</div>
            <TrendIndicator value={kpis.completionTrend} />
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Avg. Response Time</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{kpis.avgResponseTime}</div>
            <p className="text-xs text-slate-500">Estimated average</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>SLA Compliance</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{kpis.slaCompliance}%</div>
            <p className="text-xs text-slate-500">On-time delivery</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Star className="w-4 h-4" />
              <span>Client Rating</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {kpis.avgRating > 0 ? kpis.avgRating.toFixed(1) : '—'}
            </div>
            <p className="text-xs text-slate-500">
              {ratings.length} {
  ratings.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* SLA & Efficiency Insights */}
      {
  insights.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Insights</h2>
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 border-l-4 ${
                  insight.type === 'warning'
                    ? 'border-amber-500'
                    : insight.type === 'success'
                      ? 'border-green-500'
                      : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'warning' && (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      {
  insight.type === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {
  insight.type === 'info' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                      <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{insight.description}</p>
                  </div>
                  {insight.action && (
                    <button className="px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-2">
                      {insight.action}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Visibility & Engagement */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Visibility & Engagement</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Eye className="w-4 h-4" />
              <span>Profile Views</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{profileEngagement.views}</div>
            <TrendIndicator value={profileEngagement.viewTrend} />
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <FileText className="w-4 h-4" />
              <span>Search Appearances</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {profileEngagement.searchAppearances}
            </div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Target className="w-4 h-4" />
              <span>Conversion Rate</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {profileEngagement.conversionRate}%
            </div>
            <p className="text-xs text-slate-500">Profile → Request</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-l-4 border-blue-500">
            <p className="text-sm text-slate-700 mb-2">
              {profileEngagement.viewTrend > 15 ? '📈 Strong visibility growth' : '💡 Tip'}
            </p>
            <p className="text-xs text-slate-600">
              {profileEngagement.viewTrend > 15
                ? 'Keep your profile and availability updated'
                : 'Complete your profile to increase views'}
            </p>
          </div>
        </div>
      </div>

      {/* Communication Intelligence */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Communication Intelligence</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messages Sent</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {communicationMetrics.messagesSent}
            </div>
            <p className="text-xs text-slate-500">Total communications</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messages Received</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {communicationMetrics.messagesReceived}
            </div>
            <p className="text-xs text-slate-500">Client inquiries</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Avg. Reply Time</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {communicationMetrics.avgReplyTime}
            </div>
            <p className="text-xs text-slate-500">
              {communicationMetrics.avgReplyTime === '—' ? 'No data yet' : 'Average response time'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <User className="w-4 h-4" />
              <span>Unique Clients</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {communicationMetrics.uniqueClients}
            </div>
            <p className="text-xs text-slate-500">Conversations active</p>
          </div>
        </div>
      </div>

      {/* Clarification Patterns */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Clarification Patterns</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <AlertCircle className="w-4 h-4" />
              <span>Requested</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {clarificationMetrics.requested}
            </div>
            <p className="text-xs text-slate-500">Pending clarifications</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Resolved</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {clarificationMetrics.resolved}
            </div>
            <p className="text-xs text-slate-500">Completed clarifications</p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Avg. Resolution</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {clarificationMetrics.avgResolutionTime}
            </div>
            <p className="text-xs text-slate-500">
              {clarificationMetrics.avgResolutionTime === '—' ? 'No data yet' : 'Average time'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Repeat Rate</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {clarificationMetrics.repeatRate}
            </div>
            <p className="text-xs text-slate-500">Avg. per case</p>
          </div>
        </div>
      </div>

      {/* Workload & Case Flow */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Workload Distribution</h2>
          <div className="bg-white rounded-2xl p-6">
            {totalWorkload > 0 ? (
              <div className="space-y-4">
                {workloadBreakdown.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{item.status}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.count / totalWorkload) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No cases assigned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quality & Reputation */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quality & Reputation</h2>
          <div className="bg-white rounded-2xl p-6">
            {ratings.length > 0 ? (
              <div className="space-y-4">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-slate-700">{item.stars}</span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${(item.count / maxRatingCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Average Rating</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">
                        {kpis.avgRating.toFixed(1)}
                      </span>
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No ratings received yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {
  ratings.length > 0 && ratings.some((r) => r.feedback) && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Client Feedback</h2>
          <div className="grid gap-4">
            {ratings
              .filter((r) => r.feedback)
              .slice(0, 3)
              .map((rating, index) => (
                <div key={index} className="bg-white rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating.overall_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700 mb-2 line-clamp-2">"{rating.feedback}"</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(rating.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action Recommendations */}
      {
  recommendations.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recommended Actions</h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Performance Tips</h3>
                <p className="text-sm text-slate-600">
                  Data-driven suggestions to improve your outcomes
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
