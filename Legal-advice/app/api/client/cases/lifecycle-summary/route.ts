import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { aggregateCaseData } from '@/app/domain/lifecycle/LifecycleResolver';

export async function GET() {
  

  // 1. Authenticate User
  const session = await auth();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch All Requests with Relations
  const { data: requests, error } = await supabase
    .from('legal_requests')
    .select(
      `
            *,
            department:departments(name, sla_hours),
            lawyer:profiles!legal_requests_assigned_lawyer_id_fkey(id, full_name, email, avatar_url),
            documents(id, file_name, file_type),
            clarifications(id, is_resolved),
            case_messages(id, read_by),
            audit_events:audit_logs(action, created_at, details),
            lawyer_reviews(id),
            legal_opinions(
                id,
                status,
                opinion_versions(is_draft, created_at, version_number)
            )
        `
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 3. Aggregate Data via Service
  // Map to flatten structure before passing to aggregator
  const mappedRequests = (requests || []).map((req: any) => {
    const opinion = req.legal_opinions?.[0];
    const versions =
      opinion?.opinion_versions?.map((v: any) => ({
        ...v,
        submitted_at: v.created_at, // Map created_at to submitted_at
      })) || [];

    return {
      ...req,
      opinion_versions: versions,
    };
  });

  const lifecycleSummaries = aggregateCaseData(mappedRequests, user.id);

  return NextResponse.json(lifecycleSummaries);
}
