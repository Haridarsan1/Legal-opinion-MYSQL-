import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firm_name, official_email } = body;

    if (!firm_name || !official_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { user } = session;

    // 1. Create Firm
    const { data: firm, error: firmError } = await supabase
      .from('firms')
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
    const { error: profileError } = await supabase
      .from('profiles')
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
