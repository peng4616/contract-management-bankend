import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

// 全局异常过滤器
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 提取错误信息
    const message =
      exception instanceof HttpException ? exception.message : "服务器内部错误";

    // 返回统一错误格式
    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name || "InternalServerError",
    });
  }
}
