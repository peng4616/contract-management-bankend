import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "服务器内部错误";
    let errorName = "InternalServerError";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      const exceptionName = (exception as Error).name;
      errorName =
        typeof exceptionName === "string" ? exceptionName : "HttpException";
    } else if (exception instanceof Error) {
      errorName = exception.name || "Error";
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorName,
    });
  }
}
