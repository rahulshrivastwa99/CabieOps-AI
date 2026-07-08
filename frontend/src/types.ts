export type UrgencyLevel = "high" | "medium" | "low";

export type IncidentType =
  | "driver_absent"
  | "flat_tyre"
  | "client_complaint"
  | "weather_delay"
  | "vehicle_breakdown"
  | "traffic_jam";

export interface Incident {
  id: string;
  rawText?: string;
  type: IncidentType;
  timestamp: string; // ISO
  route: string;
  client: string;
  driver: string;
  urgencyScore: number; // 0-100
  urgencyLevel: UrgencyLevel;
  summary: string;
}

export interface ActionItem {
  id: string;
  incidentId: string;
  suggestedAction: string;
  reasoning: string;
  requiresHumanDecision: boolean;
  status: "pending" | "approved" | "sent";
}

export type DraftAudience = "employees" | "client" | "driver";

export interface Draft {
  id: string;
  actionId: string;
  audience: DraftAudience;
  message: string;
  edited: boolean;
  sent: boolean;
}

export type ConnectionStatus = "online" | "syncing" | "offline";
