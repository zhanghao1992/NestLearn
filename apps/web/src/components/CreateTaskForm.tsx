'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createTask } from '@/lib/task-api';
import { Priority } from '@taskflow/shared';

const PRIORITIES = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, Priority.URGENT];

export function CreateTaskForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createTask(projectId, { title: title.trim(), priority });
      setTitle('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
      <Input
        placeholder="任务标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-w-[200px] flex-1"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="h-10 rounded-md border border-gray-300 px-3 text-sm"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={loading}>
        {loading ? '...' : '添加'}
      </Button>
      {error && <span className="self-center text-xs text-red-500">{error}</span>}
    </form>
  );
}
