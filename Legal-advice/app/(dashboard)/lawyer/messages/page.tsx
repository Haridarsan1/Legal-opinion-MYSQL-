import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MessagesContent from '../../client/messages/MessagesContent';

export const metadata: Metadata = {
  title: 'Messages - Legal Opinion Portal',
  description: 'Communicate with your clients',
};

export default async function LawyerMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <MessagesContent userId={user.id} />;
}
