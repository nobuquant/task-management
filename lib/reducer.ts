import type { ExecutionReport, Task, TaskStatus } from "./types";
import { todayISO } from "./utils";

export interface BoardState {
  /** Array order *is* the board order — drag-and-drop reorders this list. */
  tasks: Task[];
}

export type BoardAction =
  | { type: "create"; task: Task }
  | { type: "update"; id: string; patch: Partial<Task> }
  | { type: "delete"; id: string }
  /** Move to a status, optionally inserting before `beforeId` for reordering. */
  | { type: "move"; id: string; status: TaskStatus; beforeId?: string | null }
  | { type: "toggleSubtask"; taskId: string; subtaskId: string }
  | { type: "toggleVote"; id: string }
  | { type: "promote"; id: string }
  | { type: "triggerAutonomousExecution"; id: string; agent: "CMO" | "COO" };

export function processAutomatedTask(task: Task): Task {
  // Trigger condition: Assigned to CMO or COO
  if (task.assigneeId === "cmo" || task.assigneeId === "coo") {
    const agent = task.assigneeId === "cmo" ? "CMO" : "COO";
    const snapshotVer = task.snapshotVersion || `v1.${Date.now().toString().slice(-4)}-snapshot`;
    const cleanId = task.id.toLowerCase().replace(/[^a-z0-9]/g, "");
    const generatedDemoUrl = task.demoUrl || `https://nobu-quant--preview-${cleanId}.web.app`;

    const existingReports = task.executionReports || [];
    const newReport: ExecutionReport = {
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent,
      summary: `Autonomous execution triggered by ${agent}. Pipeline executed, code compiled, isolated demo live.`,
      metrics: agent === "CMO" ? "Traffic CTR: +24.8% • Conversion: +4.2% • Audited Multiplier: 13.2x" : "Sharpe: 1.20 • Max DD: -31.4% • Beta: 0.12 vs Benchmark",
      demoUrl: generatedDemoUrl,
      snapshotVersion: snapshotVer,
      codeSnippet: `// Autonomous ${agent} build artifact\nexport const snapshot = "${snapshotVer}";\nexport const status = "LIVE_PREVIEW_READY";`,
    };

    return {
      ...task,
      workflowStage: task.status === "done" ? 5 : 2,
      snapshotVersion: snapshotVer,
      demoUrl: generatedDemoUrl,
      executionReports: [newReport, ...existingReports],
    };
  }

  return task;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "create": {
      const processed = processAutomatedTask(action.task);
      return { ...state, tasks: [processed, ...state.tasks] };
    }

    case "update": {
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.id) return task;
          const merged = { ...task, ...action.patch };
          // If assignee changed to CMO or COO, process automated workflow
          if (action.patch.assigneeId && (action.patch.assigneeId === "cmo" || action.patch.assigneeId === "coo")) {
            return processAutomatedTask(merged);
          }
          return merged;
        }),
      };
    }

    case "delete":
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };

    case "move": {
      const moving = state.tasks.find((task) => task.id === action.id);
      if (!moving) return state;
      // No-op when dropping a card onto itself.
      if (moving.status === action.status && action.beforeId === action.id) return state;

      const next = withStatus(moving, action.status);
      const rest = state.tasks.filter((task) => task.id !== action.id);
      const index = action.beforeId
        ? rest.findIndex((task) => task.id === action.beforeId)
        : -1;

      if (index === -1) rest.push(next);
      else rest.splice(index, 0, next);

      return { ...state, tasks: rest };
    }

    case "toggleSubtask":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === action.subtaskId
                    ? { ...subtask, done: !subtask.done }
                    : subtask,
                ),
              }
            : task,
        ),
      };

    case "toggleVote":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                votes: task.votes + (task.votedByMe ? -1 : 1),
                votedByMe: !task.votedByMe,
              }
            : task,
        ),
      };

    case "promote":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, type: "task", status: "todo", workflowStage: 2 } : task,
        ),
      };

    case "triggerAutonomousExecution":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? processAutomatedTask({ ...task, assigneeId: action.agent.toLowerCase() }) : task,
        ),
      };

    default:
      return state;
  }
}

/**
 * An idea that leaves the backlog graduates into a real task — dragging it out
 * of `💡 Brainstorm` is the same gesture as pressing "Promote to task".
 */
function withStatus(task: Task, status: TaskStatus): Task {
  const stageNumber = status === "backlog" ? 1 : status === "todo" ? 2 : status === "in-progress" ? 2 : status === "review" ? 3 : 5;
  if (task.type === "idea" && status !== "backlog") {
    return { ...task, status, type: "task", workflowStage: stageNumber };
  }
  return { ...task, status, workflowStage: stageNumber };
}
