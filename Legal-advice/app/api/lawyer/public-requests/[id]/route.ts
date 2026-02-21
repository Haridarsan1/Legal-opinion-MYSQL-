'use server';
import { createClient } from '@/lib/supabase/server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  

  const {
    data: { user },
    error: authError,
  } = { data: { user: (await auth())?.user }, error: null };

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestId = params.id;

    // Fetch the request details
    const { data: request, error } = await (await __getSupabaseClient()).from('legal_requests')
      .select(
        `
                id,
                request_number,
                title,
                description,
                priority,
                status,
                created_at,
                public_posted_at,
                department:departments(id, name),
                client:profiles!legal_requests_client_id_fkey(full_name, organization),
                proposal_count:request_proposals(id)
            `
      )
      .eq('id', requestId)
      .eq('request_type', 'public')
      .single();

    if (error) {
      console.error('Error fetching request:', error);
      return Response.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Check if lawyer has submitted a proposal
    const { data: myProposal } = await (await __getSupabaseClient()).from('request_proposals')
      .select('id, status')
      .eq('request_id', requestId)
      .eq('lawyer_id', user.id)
      .not('status', 'eq', 'withdrawn')
      .single();

    const enrichedRequest = {
      ...request,
      hasMyProposal: !!myProposal,
      myProposalStatus: myProposal?.status || null,
    };

    return Response.json({ success: true, data: enrichedRequest });
  } catch (error: any) {
    console.error('Error in API:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
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
