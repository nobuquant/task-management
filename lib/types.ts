/**
 * Domain types for the Nobu Quant tracking task board.
 *
 * Everything is intentionally serialisable (plain strings / numbers) so the
 * data can be rendered identically on the server and the client.
 */

export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

/** A `idea` is a lightweight brainstorm card; a `task` is a tracked unit of work. */
export type ItemType = "idea" | "task";

export type WorkflowStage = 1 | 2 | 3 | 4 | 5;

export interface ExecutionReport {
  id: string;
  timestamp: string;
  agent: "CMO" | "COO";
  summary: string;
  metrics: string;
  demoUrl: string;
  snapshotVersion: string;
  codeSnippet?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Tailwind classes used for the member's avatar chip. */
  accent: string;
  isAI?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  type: ItemType;
  title: string;
  /** Markdown supported — rendered by `components/ui/markdown.tsx`. */
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  /** Who raised the idea / created the task. */
  authorId: string;
  /** ISO date only (`yyyy-mm-dd`) so formatting is timezone independent. */
  dueDate: string | null;
  tags: string[];
  subtasks: Subtask[];
  votes: number;
  votedByMe: boolean;
  createdAt: string;
  
  /** Stage 1..5 in the Human-AI Integrated Workflow */
  workflowStage?: WorkflowStage;
  /** Automated live preview demo URL */
  demoUrl?: string | null;
  /** Rollback snapshot version */
  snapshotVersion?: string | null;
  /** Autonomous Agent Execution Reports & Logs */
  executionReports?: ExecutionReport[];
}

export interface ColumnMeta {
  id: TaskStatus;
  emoji: string;
  title: string;
  description: string;
  stageNumber: WorkflowStage;
  stageName: string;
  /** Small colour accent used for the column dot + count pill. */
  dot: string;
  pill: string;
}

export const COLUMNS: ColumnMeta[] = [
  {
    id: "backlog",
    emoji: "💡",
    title: "Stage 1: Brainstorm / Backlog",
    description: "Humans log ideas, tickers & hypotheses",
    stageNumber: 1,
    stageName: "Stage 1: Ideation",
    dot: "bg-violet-500",
    pill: "bg-violet-50 text-violet-700",
  },
  {
    id: "todo",
    emoji: "📋",
    title: "Stage 2: To Do (Ready)",
    description: "Scoped tasks ready for AI trigger or pickup",
    stageNumber: 2,
    stageName: "Stage 2: Processing & Demo Build",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-600",
  },
  {
    id: "in-progress",
    emoji: "⚙️",
    title: "Stage 2/3: In Progress",
    description: "Autonomous execution & active build",
    stageNumber: 2,
    stageName: "Stage 2: Execution",
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700",
  },
  {
    id: "review",
    emoji: "🧪",
    title: "Stage 3: Review / Testing",
    description: "Human review & live demo validation",
    stageNumber: 3,
    stageName: "Stage 3: Human Review",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700",
  },
  {
    id: "done",
    emoji: "🚀",
    title: "Stage 4/5: Deployed / Done",
    description: "Shipped, logged, locked & archived",
    stageNumber: 5,
    stageName: "Stage 5: Complete & Archived",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700",
  },
];

export const COLUMN_BY_ID: Record<TaskStatus, ColumnMeta> = COLUMNS.reduce(
  (acc, column) => {
    acc[column.id] = column;
    return acc;
  },
  {} as Record<TaskStatus, ColumnMeta>,
);

export const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; dot: string; rank: number }
> = {
  low: {
    label: "Low",
    chip: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
    rank: 0,
  },
  medium: {
    label: "Medium",
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    rank: 1,
  },
  high: {
    label: "High",
    chip: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    rank: 2,
  },
  urgent: {
    label: "Urgent",
    chip: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    rank: 3,
  },
};
