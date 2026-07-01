import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';

@ApiTags('任务')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: '在项目下创建任务' })
  create(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.taskService.create(userId, projectId, dto);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: '任务列表（分页 + 筛选）' })
  findPaginated(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: QueryTaskDto,
  ) {
    return this.taskService.findPaginated(userId, projectId, query);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: '任务详情' })
  findOne(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(userId, id);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: '更新任务' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.update(userId, id, dto);
  }

  @Patch('projects/:projectId/tasks/reorder')
  @ApiOperation({ summary: '批量重排序（看板拖拽用）' })
  reorder(
    @CurrentUser('id') userId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: ReorderTasksDto,
  ) {
    return this.taskService.reorder(userId, projectId, dto.items);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: '删除任务' })
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.remove(userId, id);
  }
}
