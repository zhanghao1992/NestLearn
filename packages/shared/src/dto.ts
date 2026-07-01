import { Priority } from './enums';
// ==============================
// DTO（数据传输对象）
// 后端用于校验入参，前端用于表单类型，复用同一份定义
// ==============================

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateWorkspaceDto {
  name: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
}
