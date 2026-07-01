import type { ApiResponse, ApiError } from '@taskflow/shared';
import { getToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * 通用 API 客户端
 * - 自动注入 Authorization Header
 * - 统一处理后端 { success, data, message } / { success, error } 格式
 */
export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  const json: ApiResponse<T> | ApiError = await res.json();

  if (!json.success) {
    throw new Error((json as ApiError).error.message);
  }

  return json.data;
}
