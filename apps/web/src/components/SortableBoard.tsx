'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskStatus } from '@taskflow/shared';
import type { Task } from '@taskflow/shared';
import { SortableTaskCard } from './SortableTaskCard';
import { reorderTasks, updateTaskStatus } from '@/lib/task-api';
import { statusLabel } from '@/lib/task-ui';

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

/**
 * 可拖拽看板
 * - 三列，每列内可排序
 * - 支持跨列拖拽（自动更新 status）
 * - 乐观更新：本地先变，API 失败则 refresh 回滚
 */
export function SortableBoard({
  projectId,
  initialTasks,
}: {
  projectId: string;
  initialTasks: Task[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  // 按 status 分组
  const grouped = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // over 可能是某个任务卡片，也可能是空列的 droppable id（status）
    const overId = String(over.id);
    const overTask = tasks.find((t) => t.id === overId);
    const targetStatus =
      overTask?.status ?? (COLUMNS.includes(overId as TaskStatus) ? (overId as TaskStatus) : activeTask.status);

    // 跨列：先更新 status
    let nextTasks = tasks;
    if (targetStatus !== activeTask.status) {
      // 乐观更新 status
      nextTasks = tasks.map((t) =>
        t.id === activeTask.id ? { ...t, status: targetStatus } : t,
      );
      setTasks(nextTasks);
      try {
        await updateTaskStatus(activeTask.id as string, targetStatus);
      } catch {
        router.refresh();
        return;
      }
    }

    // 重排：构建目标列的新顺序
    const colTasks = nextTasks
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    const oldIndex = colTasks.findIndex((t) => t.id === active.id);
    // over 是任务：插入其位置；over 是列：放末尾
    const newIndex = overTask
      ? colTasks.findIndex((t) => t.id === overTask.id)
      : colTasks.length;

    if (oldIndex === -1 || oldIndex === newIndex) return;

    // 数组移动
    const reordered = [...colTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // 本地乐观更新该列的 position
    const reorderedIds = reordered.map((t, i) => ({ ...t, position: i }));
    const reorderedMap = new Map(reorderedIds.map((t) => [t.id, t.position]));
    nextTasks = nextTasks.map((t) =>
      reorderedMap.has(t.id) ? { ...t, position: reorderedMap.get(t.id)! } : t,
    );
    setTasks(nextTasks);

    // 持久化：传整个项目的新顺序（拼接三列）
    const allOrdered: { id: string; order: number }[] = [];
    let order = 0;
    for (const status of COLUMNS) {
      for (const t of nextTasks.filter((x) => x.status === status).sort((a, b) => a.position - b.position)) {
        allOrdered.push({ id: t.id, order: order++ });
      }
    }
    try {
      await reorderTasks(projectId, allOrdered);
    } catch {
      router.refresh();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((status) => {
          const colTasks = grouped(status);
          return (
            <Column key={status} status={status} count={colTasks.length}>
              <SortableContext
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {colTasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-center text-xs text-gray-300">
                      拖拽任务到此
                    </p>
                  ) : (
                    colTasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
                  )}
                </div>
              </SortableContext>
            </Column>
          );
        })}
      </div>

      {/* 拖拽时的悬浮预览 */}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 rounded-lg border bg-white p-3 shadow-lg">
            <p className="text-sm font-medium">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** 单列：包含标题 + 可放置区域 */
function Column({
  status,
  count,
  children,
}: {
  status: TaskStatus;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 rounded-lg p-2 transition-colors ${isOver ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-gray-700">{statusLabel[status]}</h3>
        <span className="text-xs text-gray-400">{count}</span>
      </div>
      {children}
    </div>
  );
}
