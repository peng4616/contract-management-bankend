import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

// 定义统一的响应结构
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: T) => ({
        statusCode,
        message: "操作成功",
        data, // 类型安全赋值
      })),
    );
  }
}
