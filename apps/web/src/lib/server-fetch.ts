import { cookies } from 'next/headers';
import type { ApiResponse, ApiError } from '@taskflow/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * 服务端数据请求（用于 Server Component / Server Action）
 * 从 next/headers 读取 token，自动注入 Authorization
 *
 * 与客户端 apiClient 区别：本函数只能在服务端调用
 */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = cookies().get('taskflow_token')?.value;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    // Server Component 默认会被 Next 缓存，这里禁用确保数据实时
    cache: 'no-store',
  });

  const json: ApiResponse<T> | ApiError = await res.json();

  if (!json.success) {
    throw new Error((json as ApiError).error.message);
  }

  return json.data;
}
