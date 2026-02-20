import { BookOpen, Download, Trash2, Tag, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  userId: string;
}

export default function ResearchTab({ documents, viewMode, searchQuery, userId }: Props) {
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
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No research documents found' : 'Build your research library'}
        </h3>
        <p className="text-slate-600 mb-4">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Store case laws, judgments, and legal research for quick reference'}
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4 inline mr-2" />
          Upload Research
        </button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <ResearchCard key={doc.id} document={doc} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredDocs.map((doc) => (
        <ResearchCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function ResearchCard({ document }: { document: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1">{document.file_name}</h3>
          <div className="text-xs text-slate-500">
            Added {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
            <span className="mx-2">•</span>
            {(document.file_size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      </div>

      {document.tags && document.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {document.tags.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {!document.tags ||
        (document.tags.length === 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button className="text-xs text-slate-500 hover:text-primary flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Add tags for better search
            </button>
          </div>
        ))}
    </div>
  );
}
