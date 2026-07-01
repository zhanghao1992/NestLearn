import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('项目')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 嵌套路由：/workspaces/:workspaceId/projects
  @Post('workspaces/:workspaceId/projects')
  @ApiOperation({ summary: '在工作空间下创建项目' })
  create(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.create(userId, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/projects')
  @ApiOperation({ summary: '工作空间下的项目列表' })
  findAll(
    @CurrentUser('id') userId: string,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ) {
    return this.projectService.findAllByWorkspace(userId, workspaceId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: '项目详情' })
  findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.findOne(userId, id);
  }

  @Patch('projects/:id')
  @ApiOperation({ summary: '更新项目' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(userId, id, dto);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: '删除项目' })
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectService.remove(userId, id);
  }
}
