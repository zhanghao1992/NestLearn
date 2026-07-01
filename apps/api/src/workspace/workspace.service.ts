import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  /** 创建工作空间：创建者自动成为 OWNER + 成员（事务保证一致性） */
  async create(userId: string, dto: CreateWorkspaceDto) {
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: dto.name, ownerId: userId },
      });
      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: 'OWNER',
        },
      });
      return workspace;
    });
  }

  /** 列出当前用户加入的所有工作空间 */
  async findAllByUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { workspace: { createdAt: 'desc' } },
    });
    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  /** 查单个工作空间（需校验成员资格） */
  async findOne(userId: string, workspaceId: string) {
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!ws) throw new NotFoundException('工作空间不存在');

    await this.assertMember(userId, workspaceId);
    return ws;
  }

  /** 更新工作空间 */
  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.findOne(userId, workspaceId);
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: dto,
    });
  }

  /** 删除工作空间（级联删除成员/项目/任务） */
  async remove(userId: string, workspaceId: string) {
    const ws = await this.findOne(userId, workspaceId);
    if (ws.ownerId !== userId) {
      throw new ConflictException('仅所有者可删除工作空间');
    }
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
    return { id: workspaceId };
  }

  /** 校验用户是否为该工作空间成员，是则返回成员记录 */
  async assertMember(userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });
    if (!member) {
      throw new NotFoundException('您不属于该工作空间');
    }
    return member;
  }
}
