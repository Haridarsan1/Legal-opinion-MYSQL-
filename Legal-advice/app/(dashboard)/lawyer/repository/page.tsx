import { createClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import RepositoryContent from './RepositoryContent';

export const metadata = {
  title: 'Document Repository - Lawyer Dashboard',
  description: 'Manage legal opinions, drafts, templates, and research documents',
};

export default async function DocumentRepositoryPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  // Fetch all lawyer's documents across categories
  const { data: documents, error } = await supabase
    .from('documents')
    .select(
      `
            *,
            request:legal_requests(
                id,
                request_number,
                title,
                status,
                department:departments(name)
            )
        `
    )
    .eq('uploaded_by', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
  }

  // Categorize documents
  const categorizedDocs = {
    opinions: documents?.filter((d) => d.category === 'legal_opinion') || [],
    drafts: documents?.filter((d) => d.category === 'draft') || [],
    templates: documents?.filter((d) => d.category === 'template') || [],
    research: documents?.filter((d) => d.category === 'research') || [],
    compliance: documents?.filter((d) => d.category === 'compliance') || [],
    caseDocuments: documents?.filter((d) => d.category === 'case_document') || [],
  };

  // Get statistics
  const stats = {
    totalOpinions: categorizedDocs.opinions.length,
    totalDrafts: categorizedDocs.drafts.length,
    totalTemplates: categorizedDocs.templates.length,
    totalResearch: categorizedDocs.research.length,
    totalCompliance: categorizedDocs.compliance.length,
    totalCaseDocuments: categorizedDocs.caseDocuments.length,
  };

  return <RepositoryContent documents={categorizedDocs} stats={stats} userId={user.id} />;
}
