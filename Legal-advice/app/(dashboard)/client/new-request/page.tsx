import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import NewRequestForm from './NewRequestForm';

export const metadata: Metadata = {
  title: 'New Request - Legal Opinion Portal',
  description: 'Create a new legal opinion request',
};

export default async function NewRequestPage() {
  const supabase = await createClient();

  // Fetch departments for selection
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  return <NewRequestForm departments={departments || []} />;
}
