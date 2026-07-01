import Link from 'next/link';
import { getServerUser } from '@/lib/server-auth';
import { logoutAction } from './logout-action';

// Server Component：在服务端通过 next/headers 读取用户信息
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getServerUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/dashboard" className="font-bold">🚀 TaskFlow</Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">{user?.name ?? '用户'}</span>
          {/* Server Action：提交时在服务端清除 cookie */}
          <form action={logoutAction}>
            <button className="text-blue-600 hover:underline" type="submit">
              退出
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
