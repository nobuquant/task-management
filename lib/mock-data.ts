import type { Task, TeamMember } from "./types";

export const PROJECT = {
  name: "Nobu Quant tracking",
  code: "NOBU",
  sprint: "Autonomous Execution & Live Demos",
};

export const TEAM: TeamMember[] = [
  {
    id: "hieu",
    name: "Hieu",
    role: "Founder & Quant Lead",
    initials: "H",
    accent: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  {
    id: "thao",
    name: "Thao",
    role: "Product & Marketing Ops",
    initials: "T",
    accent: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  {
    id: "duke",
    name: "Duke",
    role: "Tech Lead & Fullstack",
    initials: "D",
    accent: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  },
  {
    id: "cmo",
    name: "CMO",
    role: "Growth & Marketing AI Agent",
    initials: "CMO",
    accent: "bg-purple-100 text-purple-700 ring-purple-200",
    isAI: true,
  },
  {
    id: "coo",
    name: "COO",
    role: "Operations & Risk AI Agent",
    initials: "COO",
    accent: "bg-amber-100 text-amber-700 ring-amber-200",
    isAI: true,
  },
];

/** The signed-in user — default to Founder (Hieu). */
export const CURRENT_USER_ID = "hieu";

/** Clean slate initial tasks — ready for new operational workflow. */
export const INITIAL_TASKS: Task[] = [];
