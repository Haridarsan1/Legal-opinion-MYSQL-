import { FileText, Folder } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-12 max-w-md text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Folder className="w-10 h-10 text-slate-400" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Opinions Yet</h2>

        <p className="text-slate-600 mb-6">
          Opinions you submit for your assigned cases will appear here for tracking and management.
        </p>

        <Link
          href="/lawyer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          View Dashboard
        </Link>

        <p className="text-xs text-slate-500 mt-6">
          Once you submit a legal opinion, it will be tracked here with status updates and client
          feedback.
        </p>
      </div>
    </div>
  );
}
