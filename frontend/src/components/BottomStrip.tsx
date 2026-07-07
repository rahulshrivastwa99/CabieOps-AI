interface Props {
  resolvedToday: number;
  avgResolutionMin: number;
  escalations: number;
}

export function BottomStrip({ resolvedToday, avgResolutionMin, escalations }: Props) {
  return (
    <footer className="bg-white border-t border-slate-200 px-4 md:px-6 py-3">
      <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto text-center">
        <Stat label="Resolved today" value={String(resolvedToday)} />
        <Stat label="Avg resolution" value={`${avgResolutionMin}m`} />
        <Stat label="Escalations" value={String(escalations)} />
      </div>
    </footer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-slate-800 tabular-nums">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
