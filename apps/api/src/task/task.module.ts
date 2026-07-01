import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [ProjectModule],
  controllers: [TaskController],
  providers: [TaskService],
  // 导出 TaskService 供 CommentModule 使用
  exports: [TaskService],
})
export class TaskModule {}
