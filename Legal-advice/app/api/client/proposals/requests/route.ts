import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const supabase = await createClient(); try {


    // Get current user
    const {
      data: { user },
      error: userError,
    } = { data: { user: (await auth())?.user }, error: null };

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch client's public requests with proposal counts
    const { data, error } = await (await __getSupabaseClient()).rpc('get_client_public_requests_with_proposal_counts', {
      p_client_id: user.id,
    });

    if (error) {
      // Fallback if function doesn't exist yet - fetch directly
      const { data: requests, error: requestError } = await (await __getSupabaseClient()).from('legal_requests')
        .select(
          `
                    id,
                    request_number,
                    title,
                    description,
                    status,
                    visibility,
                    proposal_deadline,
                    created_at
                `
        )
        .eq('client_id', user.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (requestError) {
        return NextResponse.json({ success: false, error: requestError.message }, { status: 500 });
      }

      // Get proposal counts for each request
      const requestsWithCounts = await Promise.all(
        (requests || []).map(async (request: any) => {
          const { count } = await (await __getSupabaseClient()).from('request_proposals')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', request.id)
            .not('status', 'eq', 'withdrawn');

          return {
            ...request,
            proposal_count: count || 0,
          };
        })
      );

      return NextResponse.json({ success: true, data: requestsWithCounts });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching requests with proposals:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
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
