import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";

interface ErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let message = exception.message;

    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse() as ErrorResponse;

      // 使用可选链 + 类型判断
      if (Array.isArray(responseBody?.message)) {
        message = responseBody.message.join("，");
      } else if (typeof responseBody?.message === "string") {
        message = responseBody.message;
      } else {
        message = "请求参数错误";
      }
    }

    this.logger.error(`异常: ${message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message: message || "请求参数错误",
      error: exception.name,
    });
  }
}
