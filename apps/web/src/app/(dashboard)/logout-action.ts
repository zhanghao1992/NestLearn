'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server Action：退出登录
 * 在服务端清除 cookie 并重定向到登录页
 * 注意顶部 'use server' —— 这是 Next.js 的服务端函数标记
 */
export async function logoutAction() {
  cookies().delete('taskflow_token');
  cookies().delete('taskflow_user');
  redirect('/login');
}
