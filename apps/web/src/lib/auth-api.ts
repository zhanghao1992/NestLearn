import { apiClient } from './api';
import { setAuth } from './auth';
import type { AuthResponse, User } from '@taskflow/shared';

/** 注册成功后自动写入登录态 */
export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const { accessToken, user } = await apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setAuth(accessToken, user);
  return user;
}

/** 登录成功后自动写入登录态 */
export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<User> {
  const { accessToken, user } = await apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setAuth(accessToken, user);
  return user;
}

/** 获取当前用户（校验 token 有效性） */
export async function fetchMe(): Promise<User> {
  return apiClient<User>('/auth/me');
}
