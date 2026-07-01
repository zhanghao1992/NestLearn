import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError } from '@taskflow/shared';

/**
 * 全局异常过滤器
 * 将所有异常（HTTP 异常、未知异常）统一格式化为：
 * { success: false, error: { code, message, details } }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 提取错误信息（兼容 class-validator 的校验错误）
    let code = 'INTERNAL_ERROR';
    let message = '服务器内部错误';
    let details: unknown[] | undefined;

    if (isHttp) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        code = (r.code as string) ?? exception.name;
        message = (r.message as string) ?? message;
        if (Array.isArray(r.message)) {
          details = r.message;
          message = '参数校验失败';
          code = 'VALIDATION_ERROR';
        }
      }
    } else {
      this.logger.error(
        `未处理异常: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiError = {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    };

    response.status(status).json(body);
  }
}
