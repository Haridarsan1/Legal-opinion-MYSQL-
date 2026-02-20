'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requestId = params.id;

    // Fetch the request details
    const { data: request, error } = await supabase
      .from('legal_requests')
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
    const { data: myProposal } = await supabase
      .from('request_proposals')
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
