import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import DepartmentsListContent from './DepartmentsListContent';

export const metadata: Metadata = {
  title: 'Legal Departments - Legal Opinion Portal',
  description: 'Explore our specialized legal practice areas',
};

export default async function DepartmentsPage() {
  const supabase = await createClient();

  // Fetch all departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  return <DepartmentsListContent departments={departments || []} />;
}
