import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';
import { getServerUser } from '@/lib/server-auth';
import { CommentForm } from '@/components/CommentForm';
import { CommentItem } from '@/components/CommentItem';
import type { Task } from '@taskflow/shared';
import type { Comment } from '@/lib/comment-api';
import { priorityColor, priorityLabel, statusLabel } from '@/lib/task-ui';

export default async function TaskDetailPage({
  params,
}: {
  params: { taskId: string };
}) {
  let task: Task;
  let comments: Comment[] = [];
  try {
    task = await serverFetch<Task>(`/tasks/${params.taskId}`);
    comments = await serverFetch<Comment[]>(`/tasks/${params.taskId}/comments`);
  } catch {
    notFound();
  }

  const currentUser = getServerUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-gray-600">首页</Link>
        <span>/</span>
        <span className="text-gray-600">任务详情</span>
      </div>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold">{task.title}</h1>
          <div className="flex shrink-0 gap-2">
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {statusLabel[task.status]}
            </span>
            <span className={`rounded px-2 py-0.5 text-xs ${priorityColor[task.priority]}`}>
              {priorityLabel[task.priority]}
            </span>
          </div>
        </div>
        {task.description && (
          <p className="whitespace-pre-wrap text-sm text-gray-600">{task.description}</p>
        )}
        <p className="text-xs text-gray-400">
          创建于 {new Date(task.createdAt).toLocaleString('zh-CN')}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">评论（{comments.length}）</h2>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">还没有评论，发表第一条吧 👇</p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                canDelete={comment.userId === currentUser?.id}
              />
            ))
          )}
        </div>
        <div className="rounded-lg border bg-white p-4">
          <CommentForm taskId={task.id} />
        </div>
      </section>
    </div>
  );
}
