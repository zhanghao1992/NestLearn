import { cookies } from 'next/headers';
import type { User } from '@taskflow/shared';

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

/**
 * 服务端读取 token（用于 Server Component / Route Handler / Server Action）
 * 依赖 next/headers 的 cookies()，只能在服务端调用
 */
export const getServerToken = () => cookies().get(TOKEN_KEY)?.value ?? null;

/** 服务端读取当前用户 */
export const getServerUser = (): User | null => {
  const raw = cookies().get(USER_KEY)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    // ponytail: 客户端可写坏的 cookie，信任边界上视为未登录而非 500
    return null;
  }
};
