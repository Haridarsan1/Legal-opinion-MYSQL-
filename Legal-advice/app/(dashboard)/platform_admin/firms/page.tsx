'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/shared/Card';
import { Check, X, FileText, Loader2, Link as LinkIcon, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const supabase = createClient();

export default function FirmsAdminPage() {const [firms, setFirms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFirms = async () => {
    const { data, error } = await (await __getSupabaseClient()).from('firms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to load firms');
    else setFirms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFirms();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (await __getSupabaseClient()).from('firms').update({ status }).eq('id', id);
    if (error) toast.error('Failed to update status');
    else {
      toast.success(`Firm ${status}`);
      fetchFirms();
    }
  };

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Firm Management</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium">Firm Name</th>
              <th className="p-4 font-medium">Official Email</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Documents</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => (
              <tr key={firm.id} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="p-4 font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {firm.name}
                </td>
                <td className="p-4 text-slate-600">{firm.official_email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      firm.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : firm.status === 'pending_verification'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {firm.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {firm.verification_documents &&
                      Array.isArray(firm.verification_documents) &&
                      firm.verification_documents.map((doc: any, i: number) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 p-1 hover:bg-slate-100 rounded text-blue-600 border border-transparent hover:border-blue-200"
                          title={doc.name}
                        >
                          <FileText className="w-3 h-3" />
                          <span className="text-xs truncate max-w-[80px]">{doc.name}</span>
                        </a>
                      ))}
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  {firm.status === 'pending_verification' && (
                    <>
                      <button
                        onClick={() => updateStatus(firm.id, 'active')}
                        className="p-1.5 hover:bg-green-50 text-green-600 rounded bg-white border border-slate-200"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateStatus(firm.id, 'rejected')}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded bg-white border border-slate-200"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {firms.length === 0 && <div className="p-8 text-center text-slate-500">No firms found</div>}
      </Card>
    </div>
  );
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
