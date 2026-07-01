'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import type { Task } from '@taskflow/shared';
import { priorityColor, priorityLabel } from '@/lib/task-ui';

export function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{task.title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <span className={`rounded px-1.5 py-0.5 text-[10px] ${priorityColor[task.priority]}`}>
            {priorityLabel[task.priority]}
          </span>
          {/* 阻止 pointerdown 触发拖拽，让点击能导航 */}
          <Link
            href={`/tasks/${task.id}`}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded px-1 py-0.5 text-[10px] text-gray-400 hover:text-blue-600"
          >
            详情
          </Link>
        </div>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>
      )}
    </div>
  );
}
