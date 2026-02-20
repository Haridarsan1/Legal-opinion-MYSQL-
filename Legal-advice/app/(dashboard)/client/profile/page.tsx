import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProfileContent from './ProfileContent';

export const metadata: Metadata = {
  title: 'Profile - Legal Opinion Portal',
  description: 'Manage your account settings',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return <ProfileContent profile={profile} />;
}
