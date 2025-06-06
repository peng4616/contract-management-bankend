import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { Response } from "express";
import { ResponseDto } from "../common/dto/response.dto"; // 导入 ResponseDto

// 定义错误响应接口，描述可能的错误结构
interface ErrorResponse {
  statusCode?: number; // 状态码（可选）
  message?: string | string[]; // 错误消息（字符串或字符串数组）
  error?: string; // 错误类型（可选）
}

// 使用 @Catch() 捕获所有异常（不仅限于 HttpException）
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // 创建日志实例，用于记录异常信息
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // 实现 catch 方法，处理捕获的异常
  // 参数：
  // - exception: 捕获的异常（可能是 HttpException 或其他类型）
  // - host: ArgumentsHost，包含请求上下文
  catch(exception: unknown, host: ArgumentsHost) {
    // 获取 HTTP 上下文
    const ctx = host.switchToHttp();
    // 获取 Express 响应对象
    const response = ctx.getResponse<Response>();
    // 获取 Express 请求对象，用于日志记录
    const request = ctx.getRequest<Request>();
    // 确定状态码：如果是 HttpException，使用其状态码，否则默认为 500
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    // 默认错误消息
    let message = "服务器内部错误";

    // 处理 BadRequestException（400 错误）
    if (exception instanceof BadRequestException) {
      // 获取异常的响应体
      const responseBody = exception.getResponse() as ErrorResponse;
      // 检查 message 是否为数组（常见于验证错误）
      if (Array.isArray(responseBody?.message)) {
        // 将数组消息拼接为字符串，用逗号分隔
        message = responseBody.message.join("，");
      }
      // 检查 message 是否为字符串
      else if (typeof responseBody?.message === "string") {
        // 直接使用字符串消息
        message = responseBody.message;
      }
      // 如果 message 无效，使用默认消息
      else {
        message = "请求参数错误";
      }
    }
    // 处理其他 HttpException
    else if (exception instanceof HttpException) {
      // 使用异常的默认消息
      message = exception.message;
    }
    // 处理非 HttpException（如 TypeError、SyntaxError）
    else if (exception instanceof Error) {
      message = exception.message || "服务器内部错误";
    }

    // 记录异常日志，包括请求 URL 和方法
    this.logger.error(
      `异常: ${message}, 方法: ${request.method}, URL: ${request.url}`,
      exception instanceof Error ? exception.stack : undefined
    );

    // 返回格式化的 JSON 错误响应，符合 ResponseDto 结构
    response.status(status).json({
      statusCode: status, // HTTP 状态码
      message: message, // 错误消息
      data: null, // 数据字段，始终为 null
    } as ResponseDto<null>);
  }
}
