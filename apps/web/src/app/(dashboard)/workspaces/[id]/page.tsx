import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';
import { CreateProjectForm } from '@/components/CreateProjectForm';
import type { Workspace, Project } from '@taskflow/shared';

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let workspace: Workspace;
  let projects: Project[] = [];
  try {
    workspace = await serverFetch<Workspace>(`/workspaces/${params.id}`);
    projects = await serverFetch<Project[]>(
      `/workspaces/${params.id}/projects`,
    );
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/dashboard" className="hover:text-gray-600">工作空间</Link>
        <span>/</span>
        <span className="text-gray-600">{workspace.name}</span>
      </div>

      <div className="flex justify-end">
        <Link
          href={`/workspaces/${workspace.id}/members`}
          className="text-sm text-blue-600 hover:underline"
        >
          成员管理 →
        </Link>
      </div>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">新建项目</h2>
        <CreateProjectForm workspaceId={workspace.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">项目（{projects.length}）</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400">还没有项目，创建一个吧 👆</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/workspaces/${workspace.id}/projects/${p.id}`}
                className="block rounded-lg border bg-white p-4 transition-colors hover:border-blue-400 hover:shadow-sm"
              >
                <h3 className="font-medium">{p.name}</h3>
                {p.description && (
                  <p className="mt-1 text-xs text-gray-500">{p.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
