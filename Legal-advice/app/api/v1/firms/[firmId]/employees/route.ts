import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ firmId: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Next.js 15 params are async
  const { firmId } = await params;

  try {
    // Check permissions
    const { data: firm } = await supabase
      .from('firms')
      .select('owner_id, name')
      .eq('id', firmId)
      .single();
    if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, firm_id')
      .eq('id', user.id)
      .single();

    const isOwner = firm.owner_id === user.id;
    const isFirmAdmin =
      profile?.firm_id === firmId && (profile?.role === 'firm' || profile?.role === 'admin');

    if (!isOwner && !isFirmAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role, full_name } = body;

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Use Service Role to invite
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      );
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          firm_id: firmId,
          role: role || 'lawyer',
          organization: firm.name,
          full_name: full_name || 'New User',
        },
      }
    );

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: inviteData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
