import { apiClient } from './api';
import type { Task, Priority, TaskStatus } from '@taskflow/shared';

export async function createTask(
  projectId: string,
  data: { title: string; description?: string; priority?: Priority },
): Promise<Task> {
  return apiClient<Task>(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return apiClient<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** 批量重排序任务（看板拖拽用） */
export async function reorderTasks(
  projectId: string,
  items: { id: string; order: number }[],
): Promise<Task[]> {
  return apiClient<Task[]>(`/projects/${projectId}/tasks/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  });
}
