import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@taskflow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TaskService } from '../task/task.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taskService: TaskService,
  ) {}

  /** 创建评论（需校验任务归属） */
  async create(userId: string, taskId: string, dto: CreateCommentDto) {
    // 校验用户有权访问该任务（内部会校验工作空间成员）
    await this.taskService.findOne(userId, taskId);
    return this.prisma.comment.create({
      data: { content: dto.content, taskId, userId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  /** 列出任务下的评论（按时间升序） */
  async findAllByTask(userId: string, taskId: string) {
    await this.taskService.findOne(userId, taskId);
    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** 更新评论（仅作者） */
  async update(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = await this.getOwnedComment(userId, commentId);
    return this.prisma.comment.update({
      where: { id: comment.id },
      data: dto,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  /** 删除评论（作者或 ADMIN 以上） */
  async remove(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: { include: { project: true } } },
    });
    if (!comment) throw new NotFoundException('评论不存在');

    // 作者本人可直接删除
    if (comment.userId === userId) {
      await this.prisma.comment.delete({ where: { id: commentId } });
      return { id: commentId };
    }

    // 否则需 ADMIN 以上权限：查该用户在工作空间的角色
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: comment.task.project.workspaceId,
        },
      },
      select: { role: true },
    });
    if (!membership || (membership.role !== Role.ADMIN && membership.role !== Role.OWNER)) {
      throw new ForbiddenException('只能删除自己的评论，或需管理员权限');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { id: commentId };
  }

  /** 获取评论并校验是否属于当前用户（用于编辑） */
  private async getOwnedComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.userId !== userId) {
      throw new ForbiddenException('只能编辑自己的评论');
    }
    return comment;
  }
}
