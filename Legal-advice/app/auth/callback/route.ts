import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {

    const session = await auth();
    const user = session?.user;

    if (user) {
      // Fetch user profile to get role
      const { data: profile } = await (await __getSupabaseClient()).from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Redirect to role-specific dashboard
        return NextResponse.redirect(`${origin}/dashboard/${profile.role}`);
      }
    }

    // If no profile found or error, redirect to specified next URL
    return NextResponse.redirect(`${origin}${next}`);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${next}`);
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
