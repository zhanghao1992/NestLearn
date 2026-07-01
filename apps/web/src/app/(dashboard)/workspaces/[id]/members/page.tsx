import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';
import { getServerUser } from '@/lib/server-auth';
import { InviteMemberForm } from '@/components/InviteMemberForm';
import { MemberRow } from '@/components/MemberRow';
import type { Member } from '@/lib/members-api';
import type { Workspace } from '@taskflow/shared';
import { Role } from '@taskflow/shared';

export default async function MembersPage({
  params,
}: {
  params: { id: string };
}) {
  let workspace: Workspace;
  let members: Member[] = [];
  try {
    workspace = await serverFetch<Workspace>(`/workspaces/${params.id}`);
    members = await serverFetch<Member[]>(`/workspaces/${params.id}/members`);
  } catch {
    notFound();
  }

  // 当前用户的角色：从成员列表中查找
  const currentUser = getServerUser();
  const myMembership = members.find((m) => m.userId === currentUser?.id);
  const canManage =
    myMembership?.role === Role.OWNER || myMembership?.role === Role.ADMIN;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href={`/workspaces/${params.id}`} className="hover:text-gray-600">
          {workspace.name}
        </Link>
        <span>/</span>
        <span className="text-gray-600">成员管理</span>
      </div>

      {canManage && (
        <section className="space-y-2 rounded-lg border bg-white p-4">
          <h2 className="text-sm font-semibold">邀请成员</h2>
          <InviteMemberForm workspaceId={workspace.id} />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">成员（{members.length}）</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              workspaceId={workspace.id}
              canManage={canManage}
              currentUserId={currentUser?.id ?? ''}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
