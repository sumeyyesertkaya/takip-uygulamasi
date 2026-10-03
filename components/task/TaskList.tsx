"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task } from "@/lib/db";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  containerId: string;
  tasks: Task[];
  /** Liste bir kartın içindeyse görev kartları panel renginde çizilir, kutudan ayrışır. */
  surface?: boolean;
  children?: React.ReactNode;
};

export function TaskList({ containerId, tasks, surface, children }: TaskListProps) {
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  return (
    <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-3 rounded-2xl p-1 transition-colors ${
          isOver ? "bg-surface/50" : ""
        }`}
      >
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} surface={surface} />
        ))}
        {children}
      </div>
    </SortableContext>
  );
}
