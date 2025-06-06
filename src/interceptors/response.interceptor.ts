import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Response } from "express";

// 定义统一的 API 响应结构接口
interface ApiResponse<T> {
  statusCode: number; // HTTP 状态码
  message: string; // 响应消息
  data: T; // 响应数据，泛型 T 确保类型安全
}

// 声明拦截器为可注入，Nest.js 依赖注入系统可使用
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  // 实现 intercept 方法，拦截响应并格式化
  // 参数：
  // - context: ExecutionContext，包含请求上下文
  // - next: CallHandler，处理后续管道
  // 返回：Observable<ApiResponse<T>>，格式化后的响应流
  intercept<T>(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // 获取 HTTP 响应对象
    const response = context.switchToHttp().getResponse<Response>();
    // 获取当前响应的状态码（如 200、201）
    const statusCode = response.statusCode;

    // 处理响应流
    return next.handle().pipe(
      // 使用 rxjs 的 map 操作符转换响应数据
      map((data: T) => ({
        statusCode, // 设置状态码
        message: "操作成功", // 默认成功消息
        data, // 保留原始数据，确保类型安全
      })),
    );
  }
}
