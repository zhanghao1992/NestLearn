import { z } from 'zod';

/** 登录表单校验 */
export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
});

/** 注册表单校验 */
export const registerSchema = z
  .object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少 6 位').max(32, '密码最多 32 位'),
    name: z.string().min(1, '用户名不能为空').max(50, '用户名最多 50 位'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
