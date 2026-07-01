'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@taskflow/shared';
import { Button } from '@/components/ui/Button';
import { updateMemberRole, removeMember, type Member } from '@/lib/members-api';

const roleLabel: Record<Role, string> = {
  OWNER: '所有者',
  ADMIN: '管理员',
  MEMBER: '成员',
};

const roleColor: Record<Role, string> = {
  OWNER: 'bg-purple-50 text-purple-600',
  ADMIN: 'bg-blue-50 text-blue-600',
  MEMBER: 'bg-gray-100 text-gray-600',
};

/**
 * 成员行：显示信息 + 角色操作
 * - canManage：当前用户是否有管理权限（ADMIN+）
 * - currentUserId：当前登录用户（不能操作自己）
 */
export function MemberRow({
  member,
  workspaceId,
  canManage,
  currentUserId,
}: {
  member: Member;
  workspaceId: string;
  canManage: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isSelf = member.userId === currentUserId;
  const isOwner = member.role === Role.OWNER;

  // 不能操作 OWNER 和自己
  const canChange = canManage && !isOwner && !isSelf;

  const onRoleChange = async (newRole: Role) => {
    setBusy(true);
    try {
      await updateMemberRole(workspaceId, member.userId, newRole);
      router.refresh();
    } catch {
      // 错误已由全局处理
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!confirm(`确定移除 ${member.user.name} 吗？`)) return;
    setBusy(true);
    try {
      await removeMember(workspaceId, member.userId);
      router.refresh();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
          {member.user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">
            {member.user.name}
            {isSelf && <span className="ml-2 text-xs text-gray-400">（你）</span>}
          </p>
          <p className="text-xs text-gray-400">{member.user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canChange ? (
          <select
            value={member.role}
            disabled={busy}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="h-8 rounded-md border border-gray-300 px-2 text-xs"
          >
            <option value={Role.MEMBER}>普通成员</option>
            <option value={Role.ADMIN}>管理员</option>
          </select>
        ) : (
          <span className={`rounded px-2 py-0.5 text-xs ${roleColor[member.role]}`}>
            {roleLabel[member.role]}
          </span>
        )}

        {canChange && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={onRemove}
            className="h-8 px-2 text-xs text-red-600 hover:bg-red-50"
          >
            移除
          </Button>
        )}
      </div>
    </div>
  );
}
