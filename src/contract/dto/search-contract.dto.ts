// src/contract/dto/search-contract.dto.ts
import {
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchContractDto {
  @ApiProperty({ description: "合同标题（支持模糊查询）", required: false })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: "合同状态",
    enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["DRAFT", "PENDING", "APPROVED", "REJECTED"], {
    message: "状态必须是 DRAFT, PENDING, APPROVED 或 REJECTED",
  })
  status?: string;

  @ApiProperty({ description: "最小金额", required: false })
  @IsOptional()
  @IsNumber({}, { message: "最小金额必须是数字" })
  minAmount?: number;

  @ApiProperty({ description: "最大金额", required: false })
  @IsOptional()
  @IsNumber({}, { message: "最大金额必须是数字" })
  maxAmount?: number;

  @ApiProperty({
    description: "创建开始日期（格式：YYYY-MM-DD）",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "开始日期格式必须为 YYYY-MM-DD" })
  startDate?: string;

  @ApiProperty({
    description: "创建结束日期（格式：YYYY-MM-DD）",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "结束日期格式必须为 YYYY-MM-DD" })
  endDate?: string;

  @ApiProperty({ description: "页码，从1开始", required: false, default: 1 })
  @IsOptional()
  @IsNumber({}, { message: "页码必须是数字" })
  @Min(1, { message: "页码必须大于等于1" })
  page: number = 1;

  @ApiProperty({ description: "每页数量", required: false, default: 10 })
  @IsOptional()
  @IsNumber({}, { message: "每页数量必须是数字" })
  @Min(1, { message: "每页数量必须大于等于1" })
  limit: number = 10;
}
