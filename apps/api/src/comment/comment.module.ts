import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { TaskModule } from '../task/task.module';

@Module({
  // CommentService 依赖 TaskService，需导入 TaskModule
  imports: [TaskModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
