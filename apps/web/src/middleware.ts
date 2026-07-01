import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware - 路由守卫
 * 在请求到达页面前检查登录态（读 cookie），未登录则重定向到 /login
 *
 * 注意：middleware 运行在 Edge Runtime，不能用 Node API（如 fs、bcrypt）
 */
const PROTECTED_PATHS = ['/dashboard', '/workspaces', '/tasks'];
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('taskflow_token')?.value;

  // 未登录访问受保护页面 → 跳转登录
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 已登录访问登录/注册页 → 跳转 dashboard
  if (AUTH_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 只对这些路径运行 middleware（避免拦截静态资源）
  matcher: ['/dashboard/:path*', '/workspaces/:path*', '/tasks/:path*', '/login', '/register'],
};
