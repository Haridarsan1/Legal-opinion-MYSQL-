import DocumentRow from './DocumentRow';

interface Props {
  documents: any[];
  userId: string;
  lawyerProfile: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function DocumentTable({ documents, userId, lawyerProfile }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wide">
        <div className="col-span-4">Document</div>
        <div className="col-span-3">Case</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Reviewer</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} document={doc} userId={userId} lawyerProfile={lawyerProfile} />
        ))}
      </div>
    </div>
  );
}
