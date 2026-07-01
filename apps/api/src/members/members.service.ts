import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@taskflow/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  /** 通过邮箱邀请成员（用户必须已注册） */
  async invite(
    workspaceId: string,
    dto: { email: string; role: Role },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('该用户尚未注册，无法邀请');
    }

    // 检查是否已是成员
    const existing = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: user.id, workspaceId },
      },
    });
    if (existing) {
      throw new ConflictException('该用户已是工作空间成员');
    }

    return this.prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role: dto.role,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  /** 成员列表 */
  async findAll(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
      orderBy: { role: 'asc' },
    });
  }

  /** 修改成员角色 */
  async updateRole(
    workspaceId: string,
    targetUserId: string,
    newRole: Role,
    currentUserId: string,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
    });
    if (!member) throw new NotFoundException('成员不存在');

    // 不允许把 OWNER 降级（避免工作空间失去所有者）
    if (member.role === Role.OWNER) {
      throw new ConflictException('不能修改所有者的角色');
    }

    // 不能把自己提升为 OWNER（仅可通过转让完成，本 Sprint 不实现）
    if (newRole === Role.OWNER) {
      throw new ConflictException('不支持设置为 OWNER 角色');
    }

    // 不能修改自己的角色（避免误操作降权自己）
    if (targetUserId === currentUserId) {
      throw new ConflictException('不能修改自己的角色');
    }

    return this.prisma.workspaceMember.update({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
      data: { role: newRole },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  /** 移除成员 */
  async remove(
    workspaceId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
    });
    if (!member) throw new NotFoundException('成员不存在');

    if (member.role === Role.OWNER) {
      throw new ConflictException('不能移除工作空间所有者');
    }

    if (targetUserId === currentUserId) {
      throw new ConflictException('不能移除自己，请使用退出工作空间');
    }

    await this.prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
    });
    return { id: targetUserId };
  }
}
