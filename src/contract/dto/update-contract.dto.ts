import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { ApiPropertyOptional } from '@nestjs/swagger'; // 使用 Optional 装饰器

// 更新合同的 DTO，继承创建 DTO 的部分字段
export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({
    description: '合同编号，唯一',
    example: 'CONTRACT-001',
  })
  contractNo?: string;

  @ApiPropertyOptional({ description: '合同标题', example: '销售合同' })
  title?: string;

  @ApiPropertyOptional({ description: '甲方名称', example: '公司 A' })
  partyA?: string;

  @ApiPropertyOptional({ description: '乙方名称', example: '公司 B' })
  partyB?: string;

  @ApiPropertyOptional({ description: '合同金额（万元）', example: 100.0 })
  amount?: number;

  @ApiPropertyOptional({
    description: '合同状态',
    example: 'DRAFT',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'ARCHIVED'],
  })
  status?: string;
}
