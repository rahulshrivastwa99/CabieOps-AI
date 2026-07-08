import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, Check, Pencil, AlertOctagon, BrainCircuit, Activity, FileJson } from "lucide-react";
import type { ActionItem, Incident } from "../types";

interface Props {
  rank: number;
  action: ActionItem;
  incident?: Incident;
  onApprove: (id: string) => void;
  onEdit: (id: string) => void;
  onEscalate: (id: string) => void;
  onExpand: (incidentId: string) => void;
}

export function ActionCard({ rank, action, incident, onApprove, onEdit, onEscalate, onExpand }: Props) {
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
        onClick={() => { setOpen((v) => !v); if (!open) onExpand(action.incidentId); }}
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
          
          {/* Triage Pipeline Visualization */}
          <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-4">
            {/* Step 1: Raw Input */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                <FileJson className="w-3.5 h-3.5" /> 1. Raw Ingestion (WhatsApp/Radio)
              </div>
              <p className="mt-1 text-sm text-slate-700 italic border-l-2 border-indigo-300 pl-2">
                "{incident?.rawText || "No raw text available."}"
              </p>
            </div>
            
            {/* Step 2: LLM Extraction */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-600">
                <BrainCircuit className="w-3.5 h-3.5" /> 2. LLM Extraction (Gemini)
              </div>
              <div className="mt-1 text-xs text-slate-600 grid grid-cols-2 gap-1 bg-white p-2 rounded border border-slate-200">
                <div><span className="font-medium">Type:</span> {incident?.type}</div>
                <div><span className="font-medium">Client:</span> {incident?.client}</div>
                <div><span className="font-medium">Route:</span> {incident?.route}</div>
                <div><span className="font-medium">Driver:</span> {incident?.driver}</div>
              </div>
            </div>

            {/* Step 3: Rules Engine */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                <Activity className="w-3.5 h-3.5" /> 3. Rules Engine Math (Deterministic)
              </div>
              <div className="mt-1 text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                <div className="text-xs font-semibold text-emerald-700 mb-1">Calculated Urgency Score: {incident?.urgencyScore} / 100</div>
                <p className="text-xs">{action.reasoning}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Final Suggested Action
            </div>
            <p className="mt-1 text-sm font-medium text-slate-900 border-l-2 border-slate-900 pl-2 py-1">
              {action.suggestedAction}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => onApprove(action.id)}
              disabled={action.status !== "pending"}
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 transition-colors",
                action.status === "pending"
                  ? "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400"
                  : "bg-emerald-100 text-emerald-800 cursor-not-allowed opacity-90 border border-emerald-200"
              )}
            >
              <Check className="w-4 h-4" />
              {action.status === "pending" ? "Approve Pipeline Output" : "✓ Approved - Ready to Send Drafts"}
            </button>
            <button
              onClick={() => onEdit(action.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Pencil className="w-4 h-4" />
              Edit Action
            </button>
            <button
              onClick={() => onEscalate(action.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-amber-200 text-amber-800 text-sm font-medium hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <AlertOctagon className="w-4 h-4" />
              Flag as Edge Case
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
