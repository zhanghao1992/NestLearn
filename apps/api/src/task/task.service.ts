import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import { buildMeta } from '../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectService: ProjectService,
  ) {}

  /** 创建任务（需校验项目归属） */
  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    const project = await this.projectService.findOne(userId, projectId);

    const lastTask = await this.prisma.task.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.task.create({
      data: {
        ...dto,
        projectId: project.id,
        createdById: userId,
        position: (lastTask?.position ?? 0) + 1024,
      },
    });
  }

  /** 分页查询任务（支持按状态/优先级筛选） */
  async findPaginated(userId: string, projectId: string, query: QueryTaskDto) {
    await this.projectService.findOne(userId, projectId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      projectId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        orderBy: { position: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: buildMeta(total, page, limit) };
  }

  /** 任务详情 */
  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('任务不存在');
    await this.projectService.findOne(userId, task.projectId);
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOne(userId, taskId);
    return this.prisma.task.update({ where: { id: taskId }, data: dto });
  }

  async remove(userId: string, taskId: string) {
    await this.findOne(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { id: taskId };
  }

  /**
   * 批量重排序：前端传有序数组，后端按顺序重算 position
   * 用间隔 1024 便于后续插入
   */
  async reorder(
    userId: string,
    projectId: string,
    items: { id: string; order: number }[],
  ) {
    await this.projectService.findOne(userId, projectId);

    await this.prisma.$transaction(
      items.map((item, index) =>
        this.prisma.task.update({
          where: { id: item.id },
          data: { position: index * 1024 },
        }),
      ),
    );

    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' },
    });
  }
}
