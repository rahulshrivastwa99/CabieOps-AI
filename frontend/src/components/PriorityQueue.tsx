import type { ActionItem, Incident } from "../types";
import { ActionCard } from "./ActionCard";

interface Props {
  actions: ActionItem[];
  incidentsById: Record<string, Incident>;
  onApprove: (id: string) => void;
  onEdit: (id: string) => void;
  onEscalate: (id: string) => void;
  onExpand: (incidentId: string) => void;
}

export function PriorityQueue({ actions, incidentsById, onApprove, onEdit, onEscalate, onExpand }: Props) {
  // Rank by the linked incident's urgencyScore desc.
  const ranked = [...actions].sort((a, b) => {
    const sa = incidentsById[a.incidentId]?.urgencyScore ?? 0;
    const sb = incidentsById[b.incidentId]?.urgencyScore ?? 0;
    return sb - sa;
  });

  return (
    <section className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Priority Queue</h2>
        <span className="text-xs text-slate-500">{ranked.length} to review</span>
      </header>

      {ranked.length === 0 ? (
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-3xl mb-2">✓</div>
            <div className="text-sm font-medium text-slate-700">Nothing needs your attention</div>
            <div className="text-xs text-slate-500 mt-1">All active incidents are being handled.</div>
          </div>
        </div>
      ) : (
        <div className="scroll-area flex-1 overflow-y-auto p-3 space-y-3">
          {ranked.map((a, i) => (
            <ActionCard
              key={a.id}
              rank={i + 1}
              action={a}
              incident={incidentsById[a.incidentId]}
              onApprove={onApprove}
              onEdit={onEdit}
              onEscalate={onEscalate}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </section>
  );
}
