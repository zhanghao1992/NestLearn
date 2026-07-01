import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 自定义参数装饰器：@CurrentUser()
 * 从 JWT 校验后的 req.user 中提取当前登录用户
 *
 * 用法：getProfile(@CurrentUser() user: User) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof { id: string; email: string } | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
