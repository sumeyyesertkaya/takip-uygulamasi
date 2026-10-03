"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";
import type { Task } from "@/lib/db";
import { moveTask } from "@/lib/db/tasks";
import { TaskCard } from "./TaskItem";

export const INBOX_ID = "inbox";

type DndBoardProps = {
  containers: Record<string, Task[]>;
  children: React.ReactNode;
};

export function DndBoard({ containers, children }: DndBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Sürüklenen kartın tutulduğu yatay nokta (kartın solundan itibaren)
  const [grabX, setGrabX] = useState(0);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const task = Object.values(containers).flat().find((t) => t.id === id);
    setActiveTask(task ?? null);

    const pointer = event.activatorEvent ? getEventCoordinates(event.activatorEvent) : null;
    const rect = event.active.rect.current.initial;
    setGrabX(pointer && rect ? pointer.x - rect.left : 0);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    let containerId: string | undefined;
    let index = 0;
    if (overId in containers) {
      containerId = overId;
      index = containers[overId].filter((t) => t.id !== activeId).length;
    } else {
      containerId = Object.keys(containers).find((key) =>
        containers[key].some((t) => t.id === overId),
      );
      if (containerId) index = containers[containerId].findIndex((t) => t.id === overId);
    }
    if (!containerId) return;

    await moveTask(activeId, containerId === INBOX_ID ? null : containerId, index);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          // Kart yazının uzunluğu kadar olur ve imlecin altında ortalanır (gelen kutusu gibi geniş listelerde de)
          <div style={{ marginLeft: grabX, width: "max-content", maxWidth: "16rem", transform: "translateX(-50%)" }}>
            <TaskCard task={activeTask} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
