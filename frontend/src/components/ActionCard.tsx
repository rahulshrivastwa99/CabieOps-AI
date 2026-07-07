import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, Check, Pencil, AlertOctagon } from "lucide-react";
import type { ActionItem, Incident } from "../types";

interface Props {
  rank: number;
  action: ActionItem;
  incident?: Incident;
  onApprove: (id: string) => void;
  onEdit: (id: string) => void;
  onEscalate: (id: string) => void;
}

export function ActionCard({ rank, action, incident, onApprove, onEdit, onEscalate }: Props) {
  const [open, setOpen] = useState(rank === 1);
  const needsHuman = action.requiresHumanDecision;

  return (
    <article
      className={clsx(
        "bg-white border border-slate-200 rounded-lg overflow-hidden transition-shadow hover:shadow-sm",
        needsHuman ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 focus:outline-none focus:bg-slate-50"
      >
        <div className="w-7 h-7 rounded-full bg-slate-900 text-white grid place-items-center text-sm font-bold shrink-0">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded",
                needsHuman ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              )}
            >
              {needsHuman ? "Needs your decision" : "Ready to send"}
            </span>
            {action.status === "sent" && (
              <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Sent
              </span>
            )}
          </div>
          <div className="mt-1 text-sm font-medium text-slate-800 truncate">
            {incident?.route ?? "Unassigned"}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {incident?.summary ?? "—"}
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-slate-400 shrink-0 mt-2 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100">
          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Suggested action
            </div>
            <p className="mt-1 text-sm text-slate-800">{action.suggestedAction}</p>
          </div>

          <div className="mt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Reasoning
            </div>
            <p className="mt-1 text-sm text-slate-600">{action.reasoning}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onApprove(action.id)}
              disabled={action.status !== "pending"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Approve &amp; Send
            </button>
            <button
              onClick={() => onEdit(action.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onEscalate(action.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <AlertOctagon className="w-4 h-4" />
              Escalate to Me
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
