import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  // ProjectService 依赖 WorkspaceService，需导入 WorkspaceModule
  imports: [WorkspaceModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  // 导出 ProjectService 供 TaskModule 使用
  exports: [ProjectService],
})
export class ProjectModule {}
