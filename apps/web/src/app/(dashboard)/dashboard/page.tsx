import Link from 'next/link';
import { serverFetch } from '@/lib/server-fetch';
import { CreateWorkspaceForm } from '@/components/CreateWorkspaceForm';
import type { Workspace } from '@taskflow/shared';

type WorkspaceWithRole = Workspace & { role: string };

// Server Component：服务端直接请求后端，首屏即带数据（SSR）
export default async function DashboardPage() {
  let workspaces: WorkspaceWithRole[] = [];
  let error = '';
  try {
    workspaces = await serverFetch<WorkspaceWithRole[]>('/workspaces');
  } catch (err) {
    error = err instanceof Error ? err.message : '加载失败';
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">工作空间</h1>
        <p className="text-sm text-gray-500">管理你的团队和项目</p>
      </div>

      <section className="space-y-3 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">新建工作空间</h2>
        <CreateWorkspaceForm />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">我的工作空间（{workspaces.length}）</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {workspaces.length === 0 && !error ? (
          <p className="text-sm text-gray-400">还没有工作空间，创建一个吧 👆</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="block rounded-lg border bg-white p-4 transition-colors hover:border-blue-400 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{ws.name}</h3>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    {ws.role}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  创建于 {new Date(ws.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
