import { apiClient } from './api';

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  updatedAt: string;
}

/** 发表评论 */
export async function createComment(
  taskId: string,
  content: string,
): Promise<Comment> {
  return apiClient<Comment>(`/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/** 评论列表 */
export async function fetchComments(taskId: string): Promise<Comment[]> {
  return apiClient<Comment[]>(`/tasks/${taskId}/comments`);
}

/** 删除评论 */
export async function deleteComment(commentId: string): Promise<void> {
  await apiClient<{ id: string }>(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}
