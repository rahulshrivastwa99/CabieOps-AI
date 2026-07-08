import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle, MessageSquarePlus, X, LogOut } from "lucide-react";
import clsx from "clsx";
import type { ConnectionStatus } from "../types";

interface Props {
  activeIncidents: number;
  connection: ConnectionStatus;
  onSimulateAlert?: (text: string) => Promise<void>;
  onLogout?: () => void;
}

export function TopBar({ activeIncidents, connection, onSimulateAlert, onLogout }: Props) {
  const [now, setNow] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [simText, setSimText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSimulate = async () => {
    if (!simText.trim() || !onSimulateAlert) return;
    setIsSubmitting(true);
    await onSimulateAlert(simText);
    setIsSubmitting(false);
    setModalOpen(false);
    setSimText("");
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white grid place-items-center font-bold">
              C
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Ops Copilot</div>
              <div className="text-xs text-slate-500 truncate">CabieOps AI</div>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2" />

          <select
            className="hidden sm:block text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
            defaultValue="pantnagar"
            aria-label="Select city / client"
          >
            <option value="pantnagar">Ashok Leyland — Pantnagar</option>
            <option value="haridwar">Bajaj — Haridwar</option>
            <option value="chennai">Hyundai — Chennai</option>
            <option value="gurugram">Maruti Suzuki — Gurugram</option>
          </select>

          <div className="flex-1" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Simulate Alert
            </button>

            <div
              className={clsx(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium",
                activeIncidents > 0
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              )}
              title="Active incidents"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {activeIncidents} active
            </div>

            <div className="hidden sm:block text-sm font-medium tabular-nums text-slate-700">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            <ConnectionBadge status={connection} />

            {onLogout && (
              <button 
                onClick={onLogout}
                className="ml-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Simulate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold text-slate-800">Simulate Incoming Message</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-500 mb-3">
                Paste the chaotic scenario from WhatsApp, Radio, or Client here to ingest the situation.
              </p>
              <textarea
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                placeholder="E.g. Driver Ramesh absent, 4 employees waiting, client HR asking where the cab is..."
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSimulate}
                disabled={isSubmitting || !simText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquarePlus className="w-4 h-4" />}
                Ingest Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const map = {
    online:  { icon: <Wifi className="w-3.5 h-3.5" />,        label: "Online",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    syncing: { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, label: "Syncing", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    offline: { icon: <WifiOff className="w-3.5 h-3.5" />,     label: "Offline", cls: "bg-red-50 text-red-700 border-red-200" },
  }[status];

  return (
    <div className={clsx("flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border", map.cls)}>
      {map.icon}
      <span className="hidden sm:inline">{map.label}</span>
    </div>
  );
}
