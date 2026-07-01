import { apiClient } from '@/lib/api';
import { getServerToken } from '@/lib/server-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// 这是一个 Server Component（默认，无需 'use client'）
// 它在服务端执行，直接 fetch 后端 API
export default async function Home() {
  const loggedIn = !!getServerToken();
  let health: { status: string; timestamp: string } | null = null;
  try {
    health = await apiClient<{ status: string; timestamp: string }>('/health');
  } catch {
    // 后端未启动时优雅降级
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">🚀 TaskFlow</h1>
      <p className="text-lg text-gray-500">团队任务协作平台 · 全栈学习项目</p>

      <div className="flex gap-3">
        {loggedIn ? (
          <Link href="/dashboard">
            <Button>进入控制台</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <Button>登录</Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost">注册</Button>
            </Link>
          </>
        )}
      </div>

      <div className="rounded-lg border px-6 py-4 text-sm">
        <p className="font-semibold">后端连接状态</p>
        {health ? (
          <p className="mt-1 text-green-600">
            ✅ {health.status} · {new Date(health.timestamp).toLocaleTimeString('zh-CN')}
          </p>
        ) : (
          <p className="mt-1 text-amber-600">
            ⏳ 后端未启动 — 请在 apps/api 运行 pnpm dev
          </p>
        )}
      </div>
    </main>
  );
}
