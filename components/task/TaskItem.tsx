"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db";
import { deleteTaskWithUndo } from "@/lib/undoActions";
import { isOverdue, moveTaskToToday, toggleTask, updateTaskTitle } from "@/lib/db/tasks";

const CARD_BASE =
  "group flex items-start gap-3 rounded-xl p-3.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.15)]";

// Gecikmiş görev: kırmızımsı pastel zemin (renk paletinden türetilir)
const cardTone = (overdue: boolean, surface = false) =>
  overdue ? "bg-overdue ring-1 ring-overdue-line" : surface ? "bg-task" : "bg-card";

export function TaskCard({ task, dragging }: { task: Task; dragging?: boolean }) {
  return (
    <div className={`${CARD_BASE} ${cardTone(isOverdue(task))} ${dragging ? "rotate-2 shadow-xl" : ""}`}>
      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-line" />
      <span className="min-w-0 flex-1 break-words text-xs font-medium leading-relaxed">
        {task.title}
      </span>
    </div>
  );
}

export function TaskItem({ task, surface }: { task: Task; surface?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const overdue = isOverdue(task);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: editing,
  });

  async function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== task.title) {
      await updateTaskTitle(task.id, draft);
    } else {
      setDraft(task.title);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`${CARD_BASE} ${cardTone(overdue, surface)} touch-manipulation transition-shadow hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)] ${
        editing ? "" : "cursor-grab"
      } ${isDragging ? "opacity-30" : task.completed ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.completed ? "border-accent bg-accent text-on-primary" : "border-line hover:border-accent"
        }`}
      >
        {task.completed && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M2.5 6.5 5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(task.title);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs font-medium outline-none"
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          className={`min-w-0 flex-1 cursor-text break-words text-xs font-medium leading-relaxed ${
            task.completed ? "text-muted line-through" : ""
          }`}
        >
          {task.title}
        </span>
      )}

      {overdue && (
        <button
          type="button"
          onClick={() => moveTaskToToday(task.id)}
          aria-label="Bugüne taşı"
          title="Bugüne taşı"
          className="text-muted opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 8h10m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={() => deleteTaskWithUndo(task)}
        aria-label="Görevi sil"
        className="text-muted opacity-0 transition-opacity hover:text-primary focus:opacity-100 group-hover:opacity-100"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
