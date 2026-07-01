import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';
import { CreateTaskForm } from '@/components/CreateTaskForm';
import { SortableBoard } from '@/components/SortableBoard';
import type { Project, Task } from '@taskflow/shared';

export default async function ProjectBoardPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  let project: Project;
  let tasks: Task[] = [];
  try {
    project = await serverFetch<Project>(`/projects/${params.projectId}`);
    const res = await serverFetch<{ data: Task[]; meta: unknown }>(
      `/projects/${params.projectId}/tasks?limit=100`,
    );
    tasks = res.data;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-gray-600">工作空间</Link>
        <span>/</span>
        <Link href={`/workspaces/${params.id}`} className="hover:text-gray-600">项目</Link>
        <span>/</span>
        <span className="text-gray-600">{project.name}</span>
      </div>

      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{project.name}</h1>
        <Link
          href={`/workspaces/${params.id}/members`}
          className="text-sm text-blue-600 hover:underline"
        >
          成员管理 →
        </Link>
      </div>

      {/* 创建任务 */}
      <section className="space-y-2 rounded-lg border bg-white p-4">
        <h2 className="text-sm font-semibold">添加任务</h2>
        <CreateTaskForm projectId={project.id} />
      </section>

      {/* 可拖拽看板 */}
      <SortableBoard projectId={project.id} initialTasks={tasks} />
    </div>
  );
}
