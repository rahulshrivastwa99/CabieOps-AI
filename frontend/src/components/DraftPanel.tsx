import { useState } from "react";
import clsx from "clsx";
import { Send, Users, Building2, Car } from "lucide-react";
import type { Draft, DraftAudience } from "../types";

interface Props {
  drafts: Draft[];
  onSend: (id: string) => void;
  onEdit: (id: string, next: string) => void;
}

const meta: Record<DraftAudience, { label: string; icon: React.ReactNode; bubble: string }> = {
  employees: { label: "To Waiting Employees", icon: <Users className="w-4 h-4" />,   bubble: "bg-emerald-50 border-emerald-200" },
  client:    { label: "To Client HR",         icon: <Building2 className="w-4 h-4" />, bubble: "bg-sky-50 border-sky-200" },
  driver:    { label: "To Backup Driver",     icon: <Car className="w-4 h-4" />,      bubble: "bg-amber-50 border-amber-200" },
};

export function DraftPanel({ drafts, onSend, onEdit }: Props) {
  return (
    <section className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Draft Communications</h2>
        <span className="text-xs text-slate-500">{drafts.filter((d) => !d.sent).length} pending</span>
      </header>

      {drafts.length === 0 ? (
        <div className="flex-1 grid place-items-center p-8 text-center">
          <div>
            <div className="text-sm font-medium text-slate-700">No drafts yet</div>
            <div className="text-xs text-slate-500 mt-1">Select an action to generate messages.</div>
          </div>
        </div>
      ) : (
        <div className="scroll-area flex-1 overflow-y-auto p-3 space-y-3">
          {drafts.map((d) => (
            <DraftBubble key={d.id} draft={d} onSend={onSend} onEdit={onEdit} />
          ))}
        </div>
      )}
    </section>
  );
}

function DraftBubble({
  draft,
  onSend,
  onEdit,
}: {
  draft: Draft;
  onSend: (id: string) => void;
  onEdit: (id: string, next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.message);
  const m = meta[draft.audience];

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          {m.icon}
          {m.label}
        </div>
        {draft.sent && (
          <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Sent
          </span>
        )}
      </div>

      <div className="p-3">
        <div className={clsx("rounded-2xl rounded-tl-sm border p-3 text-sm text-slate-800 whitespace-pre-wrap break-words", m.bubble)}>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => { setEditing(false); if (text !== draft.message) onEdit(draft.id, text); }}
              autoFocus
              rows={4}
              className="w-full bg-transparent focus:outline-none resize-y"
            />
          ) : (
            <button
              className="text-left w-full"
              onClick={() => !draft.sent && setEditing(true)}
              title={draft.sent ? "" : "Click to edit"}
            >
              {text}
            </button>
          )}
        </div>

        <button
          onClick={() => onSend(draft.id)}
          disabled={draft.sent}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {draft.sent ? "Sent" : "Send"}
        </button>
      </div>
    </div>
  );
}
