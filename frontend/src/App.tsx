import { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { TopBar } from "./components/TopBar";
import { IncidentFeed } from "./components/IncidentFeed";
import { PriorityQueue } from "./components/PriorityQueue";
import { DraftPanel } from "./components/DraftPanel";
import { BottomStrip } from "./components/BottomStrip";
import { ToastStack, type ToastMessage } from "./components/Toast";
import { mockIncidents, mockActions, mockDrafts } from "./data/mockData";
import type { ConnectionStatus, Draft } from "./types";

type MobileTab = "feed" | "queue" | "drafts";

export default function App() {
  const [incidents] = useState(mockIncidents);
  const [actions, setActions] = useState(mockActions);
  const [drafts, setDrafts] = useState(mockDrafts);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>(
    mockIncidents[0]?.id
  );
  const [connection] = useState<ConnectionStatus>("online");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tab, setTab] = useState<MobileTab>("feed");

  const incidentsById = useMemo(
    () => Object.fromEntries(incidents.map((i) => [i.id, i])),
    [incidents]
  );

  // Drafts visible in the right panel: those linked to the selected incident's action(s).
  const visibleDrafts: Draft[] = useMemo(() => {
    if (!selectedIncidentId) return drafts;
    const relatedActionIds = actions
      .filter((a) => a.incidentId === selectedIncidentId)
      .map((a) => a.id);
    const filtered = drafts.filter((d) => relatedActionIds.includes(d.actionId));
    return filtered.length ? filtered : drafts;
  }, [drafts, actions, selectedIncidentId]);

  const pushToast = useCallback((text: string) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleApprove = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
    pushToast("Action approved. Drafts ready to send.");
  };
  const handleEdit = (_id: string) => {
    pushToast("Open the draft panel to edit messages.");
  };
  const handleEscalate = (_id: string) => {
    pushToast("Escalated to ops manager.");
  };
  const handleSend = (id: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, sent: true } : d)));
    pushToast("Message sent.");
  };
  const handleEditDraft = (id: string, next: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, message: next, edited: true } : d)));
  };

  const stats = {
    resolvedToday: 14,
    avgResolutionMin: 7,
    escalations: 2,
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      <TopBar activeIncidents={incidents.length} connection={connection} />

      {/* Mobile tab bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-2">
        <div className="grid grid-cols-3">
          {(["feed", "queue", "drafts"] as MobileTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors focus:outline-none",
                tab === t
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-panel grid */}
      <main className="flex-1 min-h-0 p-3 md:p-4">
        <div className="h-full grid gap-3 md:gap-4 lg:grid-cols-[30%_45%_25%]">
          <div className={clsx("min-h-0 h-full", tab !== "feed" && "hidden lg:block")}>
            <IncidentFeed
              incidents={incidents}
              selectedId={selectedIncidentId}
              onSelect={setSelectedIncidentId}
            />
          </div>
          <div className={clsx("min-h-0 h-full", tab !== "queue" && "hidden lg:block")}>
            <PriorityQueue
              actions={actions}
              incidentsById={incidentsById}
              onApprove={handleApprove}
              onEdit={handleEdit}
              onEscalate={handleEscalate}
            />
          </div>
          <div className={clsx("min-h-0 h-full", tab !== "drafts" && "hidden lg:block")}>
            <DraftPanel drafts={visibleDrafts} onSend={handleSend} onEdit={handleEditDraft} />
          </div>
        </div>
      </main>

      <BottomStrip
        resolvedToday={stats.resolvedToday}
        avgResolutionMin={stats.avgResolutionMin}
        escalations={stats.escalations}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
