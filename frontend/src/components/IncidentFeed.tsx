import { useEffect, useRef } from "react";
import clsx from "clsx";
import {
  UserX,
  Wrench,
  CloudRain,
  MessageSquareWarning,
  Car,
  TrafficCone,
} from "lucide-react";
import type { Incident, IncidentType, UrgencyLevel } from "../types";

const iconFor: Record<IncidentType, React.ReactNode> = {
  driver_absent:     <UserX className="w-4 h-4" />,
  flat_tyre:         <Wrench className="w-4 h-4" />,
  client_complaint:  <MessageSquareWarning className="w-4 h-4" />,
  weather_delay:     <CloudRain className="w-4 h-4" />,
  vehicle_breakdown: <Car className="w-4 h-4" />,
  traffic_jam:       <TrafficCone className="w-4 h-4" />,
};

const labelFor: Record<IncidentType, string> = {
  driver_absent:     "Driver absent",
  flat_tyre:         "Flat tyre",
  client_complaint:  "Client complaint",
  weather_delay:     "Weather delay",
  vehicle_breakdown: "Vehicle breakdown",
  traffic_jam:       "Traffic jam",
};

const dotFor: Record<UrgencyLevel, string> = {
  high:   "bg-red-500",
  medium: "bg-amber-500",
  low:    "bg-emerald-500",
};

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function IncidentFeed({
  incidents,
  selectedId,
  onSelect,
}: {
  incidents: Incident[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const firstId = incidents[0]?.id;
  const prevFirst = useRef(firstId);

  // Auto-scroll to top when a new incident arrives.
  useEffect(() => {
    if (firstId && firstId !== prevFirst.current) {
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      prevFirst.current = firstId;
    }
  }, [firstId]);

  return (
    <section className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Incident Feed</h2>
        <span className="text-xs text-slate-500">{incidents.length} events</span>
      </header>

      {incidents.length === 0 ? (
        <EmptyState />
      ) : (
        <div ref={listRef} className="scroll-area flex-1 overflow-y-auto divide-y divide-slate-100">
          {incidents.map((inc, idx) => (
            <button
              key={inc.id}
              onClick={() => onSelect(inc.id)}
              className={clsx(
                "w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 focus:outline-none focus:bg-slate-50",
                selectedId === inc.id && "bg-slate-50",
                idx === 0 && "animate-highlightIn"
              )}
            >
              <div className="flex items-start gap-3">
                <span className={clsx("mt-1.5 w-2.5 h-2.5 rounded-full shrink-0", dotFor[inc.urgencyLevel])}
                      aria-label={`${inc.urgencyLevel} urgency`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      {iconFor[inc.type]} {labelFor[inc.type]}
                    </span>
                    <span>·</span>
                    <span className="tabular-nums">{timeAgo(inc.timestamp)}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-800 truncate">
                    {inc.route}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{inc.client}</div>
                  <p className="mt-1.5 text-sm text-slate-700 line-clamp-2">{inc.summary}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 grid place-items-center p-8 text-center">
      <div>
        <div className="text-3xl mb-2">✓</div>
        <div className="text-sm font-medium text-slate-700">All routes running smoothly</div>
        <div className="text-xs text-slate-500 mt-1">No incoming incidents right now.</div>
      </div>
    </div>
  );
}
