import { ApiProperty } from "@nestjs/swagger";

// 统一成功响应 DTO
export class ResponseDto<T> {
  @ApiProperty({ description: "状态码", example: 200 })
  statusCode: number;

  @ApiProperty({ description: "消息", example: "操作成功" })
  message: string;

  @ApiProperty({ description: "返回数据", type: Object })
  data: T;
}

// 统一错误响应 DTO
export class ErrorResponseDto {
  @ApiProperty({ description: "状态码", example: 400 })
  statusCode: number;

  @ApiProperty({ description: "错误消息", example: "合同编号已存在" })
  message: string;

  @ApiProperty({ description: "错误类型", example: "BadRequest" })
  error: string;
}
