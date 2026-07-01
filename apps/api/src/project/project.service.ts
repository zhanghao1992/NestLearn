import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  /** 创建项目（需先确认用户属于该工作空间） */
  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    await this.workspaceService.assertMember(userId, workspaceId);
    return this.prisma.project.create({
      data: { ...dto, workspaceId },
    });
  }

  /** 列出工作空间下的项目 */
  async findAllByWorkspace(userId: string, workspaceId: string) {
    await this.workspaceService.assertMember(userId, workspaceId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 项目详情 */
  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('项目不存在');
    await this.workspaceService.assertMember(userId, project.workspaceId);
    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    await this.findOne(userId, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async remove(userId: string, projectId: string) {
    await this.findOne(userId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { id: projectId };
  }
}
