import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import type { ConnectionStatus } from "../types";

interface Props {
  activeIncidents: number;
  connection: ConnectionStatus;
}

export function TopBar({ activeIncidents, connection }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
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
        </select>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
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
        </div>
      </div>
    </header>
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
