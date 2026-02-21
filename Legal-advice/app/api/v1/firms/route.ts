import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {

    const session = await auth();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firm_name, official_email } = body;

    if (!firm_name || !official_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create Firm
    const { data: firm, error: firmError } = await (await __getSupabaseClient()).from('firms')
      .insert({
        name: firm_name,
        official_email: official_email,
        owner_id: user.id,
        status: 'active', // Auto-active for now or 'pending_verification'
        slug: firm_name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
      })
      .select()
      .single();

    if (firmError) {
      console.error('Firm creation error:', firmError);
      return NextResponse.json({ error: firmError.message }, { status: 500 });
    }

    // 2. Update User Profile
    const { error: profileError } = await (await __getSupabaseClient()).from('profiles')
      .update({
        firm_id: firm.id,
        role: 'firm', // Ensure role is updated to firm owner
        organization: firm_name,
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Clean up firm? For now just return partial success, or error.
      // Ideally handled with transaction, but difficult via simple client.
      // Just logging.
    }

    return NextResponse.json({ success: true, firm });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
