import OpinionCard from './OpinionCard';

interface Props {
  opinions: any[];
  onSelectOpinion: (opinion: any) => void;
}

export default function OpinionList({ opinions, onSelectOpinion }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wide">
        <div className="col-span-4">Case & Client</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">SLA / Rating</div>
        <div className="col-span-2">Submitted</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Opinion Rows */}
      <div className="divide-y divide-slate-100">
        {opinions.map((opinion) => (
          <OpinionCard key={opinion.id} opinion={opinion} onSelect={onSelectOpinion} />
        ))}
      </div>
    </div>
  );
}
