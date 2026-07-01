// ==============================
// 统一 API 响应格式
// ==============================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

/** JWT 认证响应 */
export interface AuthResponse {
  accessToken: string;
  user: import('./types').User;
}
