import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BankProfileContent from './BankProfileContent';

export default async function BankProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch bank profile data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || profile.role !== 'bank') {
    redirect('/auth/login');
  }

  return <BankProfileContent profile={profile} />;
}
