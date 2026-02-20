interface Props {
  activeTab: string;
  onTabChange: (tab: any) => void;
  counts: {
    all: number;
    draft: number;
    submitted: number;
    pending: number;
    clarification: number;
    completed: number;
  };
}

export default function OpinionTabs({ activeTab, onTabChange, counts }: Props) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'draft', label: 'Drafts', count: counts.draft },
    { id: 'submitted', label: 'Submitted', count: counts.submitted },
    { id: 'pending', label: 'Pending Review', count: counts.pending },
    { id: 'clarification', label: 'Clarifications', count: counts.clarification },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 inline-flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
