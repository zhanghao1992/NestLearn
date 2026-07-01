'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { inviteMember } from '@/lib/members-api';
import { Role } from '@taskflow/shared';

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.MEMBER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await inviteMember(workspaceId, email.trim(), role);
      setEmail('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '邀请失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
      <Input
        type="email"
        placeholder="成员邮箱（需已注册）"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-[200px] flex-1"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="h-10 rounded-md border border-gray-300 px-3 text-sm"
      >
        <option value={Role.MEMBER}>普通成员</option>
        <option value={Role.ADMIN}>管理员</option>
      </select>
      <Button type="submit" disabled={loading}>
        {loading ? '邀请中...' : '邀请'}
      </Button>
      {error && <span className="self-center text-xs text-red-500">{error}</span>}
    </form>
  );
}
