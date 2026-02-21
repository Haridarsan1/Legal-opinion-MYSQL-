import { createClient } from '@/lib/supabase/server';

/**
 * Test Supabase connection and verify database schema
 * This script checks:
 * 1. Database connection
 * 2. Test users exist
 * 3. Legal departments are seeded
 * 4. Tables are accessible
 */

export async function testSupabaseConnection() {
  try {
    // Test 1: Get test user profiles
    const { data: profiles, error: profilesError } = (await __getSupabaseClient()).from('profiles')
      .select('id, email, role, full_name')
      .limit(5);

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError.message);
      return { success: false, error: profilesError.message };
    }

    console.log('✅ Found', profiles?.length || 0, 'test users');
    profiles?.forEach((p: any) => console.log(`   - ${p.full_name} (${p.email}) - Role: ${p.role}`));

    // Test 2: Get legal departments
    const { data: departments, error: deptError } = (await __getSupabaseClient()).from('departments')
      .select('name, sla_hours');

    if (deptError) {
      console.error('❌ Departments query failed:', deptError.message);
      return { success: false, error: deptError.message };
    }

    console.log('✅ Found', departments?.length || 0, 'legal departments');
    departments?.forEach((d: any) => console.log(`   - ${d.name} (SLA: ${d.sla_hours}h)`));

    // Test 3: Check legal_requests table
    const { data: requests, error: reqError } = (await __getSupabaseClient()).from('legal_requests')
      .select('request_number, status')
      .limit(3);

    if (reqError) {
      console.error('❌ Legal requests query failed:', reqError.message);
      return { success: false, error: reqError.message };
    }

    console.log('✅ Found', requests?.length || 0, 'legal requests');
    requests?.forEach((r: any) => console.log(`   - Req #${r.request_number} (${r.status})`));

    return {
      success: true,
      data: {
        usersCount: profiles?.length || 0,
        departmentsCount: departments?.length || 0,
        requestsCount: requests?.length || 0,
      },
    };
  } catch (error: any) {
    console.error('❌ Supabase connection failed:', error.message);
    return { success: false, error: error.message };
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
