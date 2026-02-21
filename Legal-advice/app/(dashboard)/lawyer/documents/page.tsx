import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import LawyerDocuments from './LawyerDocuments';

export const metadata: Metadata = {
  title: 'Document Repository - Legal Opinion Portal',
  description: 'Manage and review documents across all assigned cases',
};

export default async function LawyerDocumentsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile to verify lawyer role
  const { data: profile } = await (await __getSupabaseClient()).from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'lawyer') {
    redirect('/lawyer');
  }

  // Fetch all documents from assigned cases
  const { data: documents } = await (await __getSupabaseClient()).from('documents')
    .select(
      `
            *,
            request:legal_requests!inner(
                id,
                request_number,
                title,
                status,
                created_at,
                client:profiles!legal_requests_client_id_fkey(
                    full_name,
                    email
                ),
                department:departments(
                    name
                )
            ),
            uploader:profiles!documents_uploaded_by_fkey(
                full_name,
                avatar_url
            ),
            reviewer:profiles!documents_reviewed_by_fkey(
                full_name,
                avatar_url
            )
        `
    )
    .eq('request.assigned_lawyer_id', user.id)
    .order('uploaded_at', { ascending: false });

  return <LawyerDocuments documents={documents || []} userId={user.id!} lawyerProfile={profile} />;
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
