import { useState } from "react";
import clsx from "clsx";
import { Send, Users, Building2, Car, CheckCheck, Loader2 } from "lucide-react";
import type { Draft, DraftAudience } from "../types";

interface Props {
  drafts: Draft[];
  isActionApproved?: boolean;
  onSend: (id: string) => void;
  onEdit: (id: string, next: string) => void;
}

const meta: Record<DraftAudience, { label: string; icon: React.ReactNode; bubble: string; phone: string }> = {
  employees: { label: "To Waiting Employees", icon: <Users className="w-4 h-4" />,   bubble: "bg-emerald-50 border-emerald-200", phone: "Broadcast Group" },
  client:    { label: "To Client HR",         icon: <Building2 className="w-4 h-4" />, bubble: "bg-sky-50 border-sky-200", phone: "+91-9876543210" },
  driver:    { label: "To Backup Driver",     icon: <Car className="w-4 h-4" />,      bubble: "bg-amber-50 border-amber-200", phone: "+91-9988776655" },
};

export function DraftPanel({ drafts, isActionApproved = false, onSend, onEdit }: Props) {
  return (
    <section className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Draft Communications</h2>
        <span className="text-xs text-slate-500">{drafts.filter((d) => !d.sent).length} pending</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {drafts.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">Select an incident to view drafts</div>
        ) : (
          drafts.map((d) => (
            <DraftBubble 
              key={d.id} 
              draft={d} 
              isActionApproved={isActionApproved}
              onSend={onSend} 
              onEdit={onEdit} 
            />
          ))
        )}
      </div>
    </section>
  );
}

function DraftBubble({
  draft,
  isActionApproved,
  onSend,
  onEdit,
}: {
  draft: Draft;
  isActionApproved?: boolean;
  onSend: (id: string) => void;
  onEdit: (id: string, next: string) => void;
}) {
  const m = meta[draft.audience];
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(draft.message);
  const [isSending, setIsSending] = useState(false);

  // canSend is only true if the pipeline is approved and it's not already sent
  const canSend = isActionApproved && !draft.sent && !isSending;

  const handleSend = () => {
    setIsSending(true);
    // Simulate network delay for WhatsApp API
    setTimeout(() => {
      setIsSending(false);
      onSend(draft.id);
    }, 1200);
  };

  return (
    <div className={clsx("rounded-lg border overflow-hidden shadow-sm transition-opacity", !isActionApproved ? "opacity-60" : "opacity-100", "border-slate-200")}>
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            {m.icon}
            {m.label}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{m.phone}</div>
        </div>
        {draft.sent && (
          <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> Sent
          </span>
        )}
      </div>

      <div className={clsx("p-3", draft.sent ? "bg-[#efe6dd]" : "bg-white")}>
        <div className={clsx("relative rounded-2xl rounded-tl-sm border p-3 text-sm text-slate-800 whitespace-pre-wrap break-words shadow-sm", draft.sent ? "bg-[#dcf8c6] border-[#dcf8c6]" : m.bubble)}>
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
              className="text-left w-full cursor-text"
              onClick={() => !draft.sent && setEditing(true)}
              title={draft.sent ? "" : "Click to edit"}
            >
              {text}
            </button>
          )}
          {draft.sent && (
             <div className="absolute bottom-1 right-2 flex items-center gap-1">
               <span className="text-[10px] text-slate-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
             </div>
          )}
        </div>

        {!draft.sent && (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={clsx(
              "mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 transition-colors",
              canSend 
                ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {!isActionApproved 
               ? "Approve Action First" 
               : isSending ? "Dispatching to Twilio..." : "Send via WhatsApp"}
          </button>
        )}
      </div>
    </div>
  );
}
