import { FileEdit, Download, Trash2, Tag, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  userId: string;
}

export default function DraftsTab({ documents, viewMode, searchQuery, userId }: Props) {
  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileEdit className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No drafts found' : 'No drafts yet'}
        </h3>
        <p className="text-slate-600 mb-4">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Create legal opinion drafts before submitting to cases'}
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Create Draft
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDocs.map((doc) => (
        <DraftCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function DraftCard({ document }: { document: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
          <FileEdit className="w-6 h-6 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">{document.file_name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                  Private
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
                </span>
                <span>•</span>
                <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {document.tags && document.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              {document.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <LinkIcon className="w-4 h-4" />
              Attach to Case
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
