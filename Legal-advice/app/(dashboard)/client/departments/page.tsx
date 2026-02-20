import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import DepartmentsListContent from './DepartmentsListContent';

export const metadata: Metadata = {
  title: 'Legal Departments - Legal Opinion Portal',
  description: 'Explore our specialized legal practice areas',
};

export default async function DepartmentsPage() {
  

  // Fetch all departments
  const { data: departments } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  return <DepartmentsListContent departments={departments || []} />;
}
