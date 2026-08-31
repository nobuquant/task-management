"use client";

import { Bot, CalendarDays, CheckCircle2, ExternalLink, GitBranch, ListChecks, Sparkles } from "lucide-react";
import type { DragEvent } from "react";

import type { Task, TaskStatus, TeamMember } from "@/lib/types";
import {
  DUE_TONE_CLASS,
  cn,
  dueMeta,
  stripMarkdown,
  subtaskProgress,
} from "@/lib/utils";

import { CardMenu } from "./card-menu";
import { Avatar, UnassignedAvatar } from "./ui/avatar";
import { PriorityBadge, TagChip } from "./ui/badge";

export function TaskCard({
  task,
  assignee,
  today,
  isDragging,
  onEdit,
  onMove,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  assignee: TeamMember | null;
  today: string;
  isDragging: boolean;
  onEdit: () => void;
  onMove: (status: TaskStatus) => void;
  onDelete: () => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: (event: DragEvent<HTMLElement>) => void;
}) {
  const progress = subtaskProgress(task.subtasks);
  const due = task.dueDate ? dueMeta(task.dueDate, today) : null;
  const preview = stripMarkdown(task.description);
  const isDone = task.status === "done";
  const isAI = assignee?.isAI || assignee?.id === "cmo" || assignee?.id === "coo";

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5",
        "active:cursor-grabbing",
        isDragging && "rotate-1 opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.workflowStage && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              Stage {task.workflowStage}
            </span>
          )}
          {isAI && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 ring-1 ring-inset ring-purple-200">
              <Bot className="h-2.5 w-2.5 text-purple-600" />
              Auto-Exec
            </span>
          )}
        </div>
        <CardMenu
          task={task}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
        />
      </div>

      {/* Stretched target: the whole card opens the editor */}
      <button
        type="button"
        onClick={onEdit}
        className="mt-2 block w-full text-left after:absolute after:inset-0 after:rounded-xl after:content-['']"
      >
        <h3
          className={cn(
            "line-clamp-2 text-sm font-semibold text-slate-900",
            isDone && "text-slate-500 line-through decoration-slate-300",
          )}
        >
          {task.title}
        </h3>
      </button>

      {preview && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {preview}
        </p>
      )}

      {/* Tags and Metadata */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1">
        {task.tags.map((tag) => (
          <TagChip key={tag} tag={tag} />
        ))}
        {task.snapshotVersion && (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
            <GitBranch className="h-2.5 w-2.5 text-slate-400" />
            {task.snapshotVersion}
          </span>
        )}
      </div>

      {/* Live Demo URL Badge */}
      {task.demoUrl && (
        <div className="mt-2.5">
          <a
            href={task.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Live Demo Preview
          </a>
        </div>
      )}

      {progress.total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              {progress.done === progress.total ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ListChecks className="h-3.5 w-3.5 text-slate-400" />
              )}
              {progress.done}/{progress.total} done
            </span>
            <span className="tabular-nums text-slate-400">{progress.percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Checklist ${progress.done} of ${progress.total} complete`}
            className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300 ease-out",
                progress.done === progress.total ? "bg-emerald-500" : "bg-slate-900",
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      <footer className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="flex min-w-0 items-center gap-1.5">
          {assignee ? (
            <>
              <Avatar member={assignee} size="sm" />
              <span className="truncate text-xs font-medium text-slate-600">
                {assignee.name}
              </span>
            </>
          ) : (
            <>
              <UnassignedAvatar size="sm" />
              <span className="truncate text-xs text-slate-400">Unassigned</span>
            </>
          )}
        </span>

        {due && (
          <span
            title={due.absolute}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
              isDone ? DUE_TONE_CLASS.normal : DUE_TONE_CLASS[due.tone],
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {isDone ? due.absolute : due.label}
          </span>
        )}
      </footer>
    </article>
  );
}
