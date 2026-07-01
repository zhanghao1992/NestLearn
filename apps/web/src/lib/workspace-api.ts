import { apiClient } from './api';
import type { Workspace } from '@taskflow/shared';

/** 创建工作空间（客户端调用） */
export async function createWorkspace(name: string): Promise<Workspace & { role: string }> {
  return apiClient<Workspace & { role: string }>('/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

/** 删除工作空间（客户端调用） */
export async function deleteWorkspace(id: string): Promise<void> {
  await apiClient<{ id: string }>(`/workspaces/${id}`, { method: 'DELETE' });
}
