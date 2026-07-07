import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { io } from "socket.io-client";
import { TopBar } from "./components/TopBar";
import { IncidentFeed } from "./components/IncidentFeed";
import { PriorityQueue } from "./components/PriorityQueue";
import { DraftPanel } from "./components/DraftPanel";
import { BottomStrip } from "./components/BottomStrip";
import { ToastStack, type ToastMessage } from "./components/Toast";
import type { ConnectionStatus, Draft, Incident, ActionItem } from "./types";

type MobileTab = "feed" | "queue" | "drafts";

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();
  const [connection, setConnection] = useState<ConnectionStatus>("offline");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tab, setTab] = useState<MobileTab>("feed");

  const pushToast = useCallback((text: string) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), text }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        pushToast("Logged in successfully");
      } else {
        pushToast("Login failed: " + data.message);
      }
    } catch (err) {
      pushToast("Login error");
    }
  };

  const transformData = useCallback((data: any[]) => {
    const newIncidents: Incident[] = [];
    const newActions: ActionItem[] = [];
    const newDrafts: Draft[] = [];

    data.filter(item => item.status !== 'resolved').forEach(item => {
      newIncidents.push({
        id: item._id,
        type: item.type,
        timestamp: item.createdAt || new Date().toISOString(),
        route: item.route || 'Unknown Route',
        client: item.client || 'Unknown Client',
        driver: item.driver || 'Unknown',
        urgencyScore: item.urgencyScore || 0,
        urgencyLevel: item.urgencyLevel || 'low',
        summary: item.summary || ''
      });

      newActions.push({
        id: item._id,
        incidentId: item._id,
        suggestedAction: item.suggestedAction || '',
        reasoning: item.reasoning || '',
        requiresHumanDecision: !!item.requiresHumanDecision,
        status: item.actionStatus || 'pending'
      });

      item.drafts?.forEach((d: any) => {
        newDrafts.push({
          id: d._id,
          actionId: item._id,
          audience: d.audience,
          message: d.message,
          edited: d.edited,
          sent: d.sent
        });
      });
    });

    setIncidents(newIncidents);
    setActions(newActions);
    setDrafts(newDrafts);
    if (newIncidents.length > 0 && !selectedIncidentId) {
      setSelectedIncidentId(newIncidents[0].id);
    }
  }, [selectedIncidentId]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/incidents`);
      const data = await res.json();
      if (data.success) {
        transformData(data.data);
      }
    } catch (err) {
      pushToast("Failed to fetch data");
    }
  }, [token, transformData, pushToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL);
    socket.on('connect', () => setConnection('online'));
    socket.on('disconnect', () => setConnection('offline'));
    socket.on('new_incident', () => {
      pushToast("New incident received!");
      fetchData();
    });
    socket.on('incident_updated', () => {
      fetchData();
    });
    return () => { socket.disconnect(); };
  }, [token, fetchData, pushToast]);

  const incidentsById = useMemo(
    () => Object.fromEntries(incidents.map((i) => [i.id, i])),
    [incidents]
  );

  const visibleDrafts: Draft[] = useMemo(() => {
    if (!selectedIncidentId) return drafts;
    const relatedActionIds = actions
      .filter((a) => a.incidentId === selectedIncidentId)
      .map((a) => a.id);
    const filtered = drafts.filter((d) => relatedActionIds.includes(d.actionId));
    return filtered.length ? filtered : drafts;
  }, [drafts, actions, selectedIncidentId]);

  const updateBackendAction = async (id: string, status: string) => {
    try {
      await fetch(`${API_URL}/incidents/${id}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      pushToast("Network error updating action");
    }
  };

  const updateBackendDraft = async (incidentId: string, draftId: string, payload: any) => {
    try {
      await fetch(`${API_URL}/incidents/${incidentId}/drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      pushToast("Network error updating draft");
    }
  };

  const handleApprove = (id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)));
    updateBackendAction(id, "approved");
    pushToast("Action approved. Drafts ready to send.");
  };
  const handleEdit = (_id: string) => {
    pushToast("Open the draft panel to edit messages.");
  };
  const handleEscalate = (id: string) => {
    updateBackendAction(id, "escalated");
    pushToast("Escalated to ops manager.");
  };
  const handleSend = (id: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, sent: true } : d)));
    const draft = drafts.find(d => d.id === id);
    if (draft) updateBackendDraft(draft.actionId, id, { sent: true });
    pushToast("Message sent.");
  };
  const handleEditDraft = (id: string, next: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, message: next, edited: true } : d)));
    const draft = drafts.find(d => d.id === id);
    if (draft) updateBackendDraft(draft.actionId, id, { message: next });
  };

  const stats = {
    resolvedToday: 0, // In real app, calculate from backend
    avgResolutionMin: 0,
    escalations: 0,
  };

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="p-8 bg-white rounded-xl shadow-lg flex flex-col gap-4 w-96">
          <h1 className="text-2xl font-bold text-slate-800 text-center">CabieOps Login</h1>
          <input type="text" placeholder="Username (admin)" className="border p-2 rounded" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password (password)" className="border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="bg-slate-900 text-white font-medium p-2 rounded hover:bg-slate-800 transition">Log In</button>
          <ToastStack toasts={toasts} onDismiss={dismissToast} />
        </form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      <TopBar activeIncidents={incidents.length} connection={connection} />

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
