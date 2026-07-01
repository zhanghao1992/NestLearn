'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createWorkspace } from '@/lib/workspace-api';

/** 创建工作空间表单：提交后刷新路由，Server Component 自动重新取数 */
export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createWorkspace(name.trim());
      setName('');
      // 关键：触发 Server Component 重新取数
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        placeholder="工作空间名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? '创建中...' : '创建'}
      </Button>
      {error && <span className="self-center text-xs text-red-500">{error}</span>}
    </form>
  );
}
