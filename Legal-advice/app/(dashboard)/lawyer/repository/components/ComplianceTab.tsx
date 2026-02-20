import { Shield, Download, Upload, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Props {
  documents: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  userId: string;
}

const COMPLIANCE_TYPES = {
  bar_council: 'Bar Council Certificate',
  enrollment: 'Enrollment Proof',
  cle: 'CLE Certificate',
  identity: 'Identity Verification',
  professional_indemnity: 'Professional Indemnity',
  other: 'Other Compliance Document',
};

export default function ComplianceTab({ documents, viewMode, searchQuery, userId }: Props) {
  const filteredDocs = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.file_name?.toLowerCase().includes(searchLower) ||
      doc.document_type?.toLowerCase().includes(searchLower)
    );
  });

  if (filteredDocs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {searchQuery ? 'No compliance documents found' : 'No compliance documents yet'}
        </h3>
        <p className="text-slate-600 mb-2">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Upload your professional credentials and compliance documents'}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg mb-4 inline-flex">
          <AlertCircle className="w-4 h-4" />
          <span>Visible to Admin only - Never shared with clients</span>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Compliance Document
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">
          These documents are private and only visible to you and administrators
        </span>
      </div>

      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <ComplianceCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}

function ComplianceCard({ document }: { document: any }) {
  const docType = document.document_type || 'other';
  const typeName =
    COMPLIANCE_TYPES[docType as keyof typeof COMPLIANCE_TYPES] || 'Compliance Document';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">{document.file_name}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                {typeName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-medium">Private</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4 text-sm">
            <div>
              <span className="text-slate-500">Uploaded:</span>
              <div className="font-medium text-slate-900 mt-0.5">
                {format(new Date(document.uploaded_at), 'MMM dd, yyyy')}
              </div>
            </div>
            <div>
              <span className="text-slate-500">File Size:</span>
              <div className="font-medium text-slate-900 mt-0.5">
                {(document.file_size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <span className="text-xs text-slate-400 ml-auto">
              {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
