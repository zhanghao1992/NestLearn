import Cookies from 'js-cookie';
import type { User } from '@taskflow/shared';

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

/** 读取 token（客户端） */
export const getToken = () => Cookies.get(TOKEN_KEY) ?? null;

/** 读取用户信息（客户端） */
export const getUser = (): User | null => {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

/** 持久化登录态 */
export const setAuth = (token: string, user: User) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
  // ponytail: JSON.stringify(undefined) 返回 undefined（非字符串），cookie 会变成字面量 "undefined" 污染服务端读取
  if (user) Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, sameSite: 'lax' });
};

/** 清除登录态 */
export const clearAuth = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
};

/** 是否已登录 */
export const isAuthenticated = () => !!getToken();
