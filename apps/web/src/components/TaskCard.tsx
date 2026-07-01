'use client';

import { useRouter } from 'next/navigation';
import { TaskStatus } from '@taskflow/shared';
import type { Task } from '@taskflow/shared';
import { updateTaskStatus } from '@/lib/task-api';
import { priorityColor, priorityLabel } from '@/lib/task-ui';

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
  [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
  [TaskStatus.DONE]: null, // 已完成，无下一步
};

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();

  const advance = async () => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    try {
      await updateTaskStatus(task.id, next);
      router.refresh();
    } catch {
      // 错误已由全局提示，这里静默
    }
  };

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{task.title}</p>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${priorityColor[task.priority]}`}
        >
          {priorityLabel[task.priority]}
        </span>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {new Date(task.createdAt).toLocaleDateString('zh-CN')}
        </span>
        {NEXT_STATUS[task.status] ? (
          <button
            onClick={advance}
            className="rounded px-2 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50"
          >
            推进 →
          </button>
        ) : (
          <span className="text-[10px] text-green-600">✓ 完成</span>
        )}
      </div>
    </div>
  );
}
