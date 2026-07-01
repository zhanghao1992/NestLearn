import { apiClient } from './api';
import type { Role } from '@taskflow/shared';

export interface Member {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  user: { id: string; email: string; name: string; avatarUrl: string | null };
}

/** 邀请成员 */
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: Role,
): Promise<Member> {
  return apiClient<Member>(`/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
}

/** 修改成员角色 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: Role,
): Promise<Member> {
  return apiClient<Member>(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

/** 移除成员 */
export async function removeMember(
  workspaceId: string,
  userId: string,
): Promise<void> {
  await apiClient<{ id: string }>(`/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
  });
}
