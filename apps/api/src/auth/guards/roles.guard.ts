import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@taskflow/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RBAC 角色守卫
 * 结合 @Roles() 装饰器使用：校验当前用户在工作空间中是否有足够权限
 *
 * 权限层级：OWNER > ADMIN > MEMBER
 * 声明 @Roles(Role.MEMBER) 则所有人可访问
 * 声明 @Roles(Role.ADMIN) 则 OWNER/ADMIN 可访问
 *
 * 路由需在 URL 中携带 workspaceId 参数（路径或查询），Guard 会据此查成员角色
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 未声明 @Roles() 的接口，不需要角色校验
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const workspaceId = this.extractWorkspaceId(request);

    if (!userId || !workspaceId) {
      throw new ForbiddenException('无法确定权限范围');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('您不属于该工作空间');
    }

    // OWNER 永远拥有所有权限
    if (membership.role === Role.OWNER) {
      return true;
    }

    if (!requiredRoles.includes(membership.role as Role)) {
      throw new ForbiddenException('您的角色无权执行此操作');
    }

    return true;
  }

  /** 从请求中提取 workspaceId：优先路径参数，其次 body */
  private extractWorkspaceId(request: {
    params?: Record<string, string>;
    body?: { workspaceId?: string };
  }): string | undefined {
    return request.params?.workspaceId ?? request.body?.workspaceId;
  }
}
