import { apiClient } from './api';
import type { Project } from '@taskflow/shared';

export async function createProject(
  workspaceId: string,
  data: { name: string; description?: string },
): Promise<Project> {
  return apiClient<Project>(`/workspaces/${workspaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
