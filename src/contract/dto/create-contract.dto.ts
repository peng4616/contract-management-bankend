import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 导入 Swagger 装饰器

// 创建合同的 DTO
export class CreateContractDto {
  @ApiProperty({ description: '合同编号，唯一', example: 'CONTRACT-001' }) // Swagger 文档描述
  @IsString()
  @IsNotEmpty()
  contractNo: string;

  @ApiProperty({ description: '合同标题', example: '销售合同' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '甲方名称', example: '公司 A' })
  @IsString()
  @IsNotEmpty()
  partyA: string;

  @ApiProperty({ description: '乙方名称', example: '公司 B' })
  @IsString()
  @IsNotEmpty()
  partyB: string;

  @ApiProperty({ description: '合同金额（万元）', example: 100.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: '合同状态',
    example: 'DRAFT',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'ARCHIVED'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
