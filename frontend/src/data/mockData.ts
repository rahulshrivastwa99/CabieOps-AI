import type { Incident, ActionItem, Draft } from "../types";

// Realistic Ashok Leyland / Pantnagar demo scenario.
const now = Date.now();
const min = (m: number) => new Date(now - m * 60_000).toISOString();

export const mockIncidents: Incident[] = [
  {
    id: "INC-1042",
    type: "driver_absent",
    timestamp: min(4),
    route: "Route P-07 · Rudrapur → AL Plant Gate 2",
    client: "Ashok Leyland — Pantnagar",
    driver: "Rakesh Bisht",
    urgencyScore: 92,
    urgencyLevel: "high",
    summary: "Driver not reachable. 7 employees waiting at Rudrapur pickup, shift starts 06:30.",
  },
  {
    id: "INC-1041",
    type: "flat_tyre",
    timestamp: min(11),
    route: "Route P-03 · Kashipur → AL Plant Gate 1",
    client: "Ashok Leyland — Pantnagar",
    driver: "Mohan Singh Rawat",
    urgencyScore: 78,
    urgencyLevel: "high",
    summary: "Flat tyre on NH-74 near Bazpur. 11 employees onboard. ETA impact: +35 min.",
  },
  {
    id: "INC-1040",
    type: "weather_delay",
    timestamp: min(18),
    route: "All Haldwani corridor routes",
    client: "Ashok Leyland — Pantnagar",
    driver: "—",
    urgencyScore: 55,
    urgencyLevel: "medium",
    summary: "Heavy rainfall advisory, Haldwani–Rudrapur stretch. Expect 20–30 min delays.",
  },
  {
    id: "INC-1039",
    type: "client_complaint",
    timestamp: min(27),
    route: "Route P-11 · Sitarganj",
    client: "Ashok Leyland — Pantnagar HR",
    driver: "Praveen Joshi",
    urgencyScore: 48,
    urgencyLevel: "medium",
    summary: "HR flagged repeated late arrivals this week. Requesting written explanation by EOD.",
  },
  {
    id: "INC-1038",
    type: "traffic_jam",
    timestamp: min(41),
    route: "Route P-05 · Gadarpur",
    client: "Ashok Leyland — Pantnagar",
    driver: "Suresh Kumar",
    urgencyScore: 30,
    urgencyLevel: "low",
    summary: "Slow-moving traffic near Kichha bypass. On track but monitoring.",
  },
];

export const mockActions: ActionItem[] = [
  {
    id: "ACT-9001",
    incidentId: "INC-1042",
    suggestedAction:
      "Split Route P-07: assign standby driver Neeraj Pandey to pick up 4 employees now; dispatch second vehicle (TN-01-AB-4432) for remaining 3.",
    reasoning:
      "Standby Neeraj is 6 km away and can reach pickup in ~12 min. Splitting keeps shift start within +8 min SLA vs +40 min with a single replacement.",
    requiresHumanDecision: true,
    status: "pending",
  },
  {
    id: "ACT-9002",
    incidentId: "INC-1041",
    suggestedAction:
      "Send roadside assistance to KM 34 NH-74 and notify passengers. Keep route active — repair ETA 25 min, faster than sending replacement.",
    reasoning:
      "Nearest replacement vehicle is 40 min away. On-site tyre change historically completes in 22–28 min. Net saving: ~15 min.",
    requiresHumanDecision: false,
    status: "pending",
  },
  {
    id: "ACT-9003",
    incidentId: "INC-1040",
    suggestedAction:
      "Pre-emptively notify all Haldwani-corridor employees and client HR of possible 20–30 min delay window.",
    reasoning:
      "IMD rainfall advisory active for next 2 hours. Proactive comms reduces inbound complaint volume by ~70% based on prior weather events.",
    requiresHumanDecision: false,
    status: "pending",
  },
  {
    id: "ACT-9004",
    incidentId: "INC-1039",
    suggestedAction:
      "Draft written response to HR citing last week's route data (3 delays, all weather-linked). Escalate to ops manager for sign-off.",
    reasoning:
      "Client-facing written communication requires human review before dispatch.",
    requiresHumanDecision: true,
    status: "pending",
  },
];

export const mockDrafts: Draft[] = [
  // ACT-9001
  {
    id: "DR-01",
    actionId: "ACT-9001",
    audience: "employees",
    message:
      "Good morning. Your P-07 pickup will be handled by two vehicles today due to a driver change. First vehicle arrives in ~12 min, second in ~18 min. You will reach the plant on time. — CabieOps",
    edited: false,
    sent: false,
  },
  {
    id: "DR-02",
    actionId: "ACT-9001",
    audience: "client",
    message:
      "Hi HR team, Route P-07 has a driver reassignment this morning. All 7 employees will be dispatched via two vehicles. Expected plant arrival: on-time to +8 min. Will share confirmation once boarded.",
    edited: false,
    sent: false,
  },
  {
    id: "DR-03",
    actionId: "ACT-9001",
    audience: "driver",
    message:
      "Neeraj bhai, P-07 pickup ka backup aap le lo. 4 passengers — Rudrapur main stop, 06:18 tak pahunchna hai. Confirm karo please.",
    edited: false,
    sent: false,
  },
  // ACT-9002
  {
    id: "DR-04",
    actionId: "ACT-9002",
    audience: "employees",
    message:
      "Namaste. Aapke vehicle mein chhoti si tyre issue hai, roadside team 5 min mein pahunch rahi hai. Total delay ~25 min. Thoda paani/AC on rahega. Dhanyavaad.",
    edited: false,
    sent: false,
  },
  {
    id: "DR-05",
    actionId: "ACT-9002",
    audience: "client",
    message:
      "Route P-03 delayed ~25 min due to on-route tyre repair. All 11 employees safe onboard. Will confirm arrival at Gate 1.",
    edited: false,
    sent: false,
  },
];
