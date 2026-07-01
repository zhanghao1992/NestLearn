import { SetMetadata } from '@nestjs/common';
import { Role } from '@taskflow/shared';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器：标注某个接口需要的最低角色
 * 用法：@Roles(Role.ADMIN) → 只有 OWNER/ADMIN 能访问
 *
 * 注：OWNER 隐含拥有所有权限，Guard 会自动放行
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
