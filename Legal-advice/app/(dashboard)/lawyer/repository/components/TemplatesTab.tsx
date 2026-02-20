import { FolderOpen, Download, Copy, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
}

export default function TemplatesTab({ documents, viewMode, searchQuery }: Props) {
  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.practice_area?.toLowerCase().includes(searchLower) ||
      doc.template_category?.toLowerCase().includes(searchLower)
    );
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No templates found' : 'No templates yet'}
        </h3>
        <p className="text-slate-600 mb-4">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Create reusable legal templates for faster workflows'}
        </p>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Upload Template
        </button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <TemplateCard key={doc.id} document={doc} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredDocs.map((doc) => (
        <TemplateCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function TemplateCard({ document }: { document: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
          <FolderOpen className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 truncate">{document.file_name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {document.practice_area && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                {document.practice_area}
              </span>
            )}
            {document.template_category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {document.template_category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-4">
        Last updated {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );
}
