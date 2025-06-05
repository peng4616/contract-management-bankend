import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Contract } from './contract.entity';
import { ApiProperty } from '@nestjs/swagger';

// 附件实体
@Entity()
export class Attachment {
  @ApiProperty({ description: '附件 ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '文件名', example: 'contract.pdf' })
  @Column()
  fileName: string;

  @ApiProperty({
    description: '文件存储路径',
    example: 'uploads/contract-001.pdf',
  })
  @Column()
  filePath: string;

  @ApiProperty({ description: '文件类型', example: 'application/pdf' })
  @Column()
  mimeType: string;

  @ApiProperty({ description: '文件大小（字节）', example: 102400 })
  @Column()
  fileSize: number;

  @ApiProperty({ description: '关联合同', type: () => Contract })
  @ManyToOne(() => Contract, (contract) => contract.id, { onDelete: 'CASCADE' }) // 合同删除时附件自动删除
  contract: Contract;

  @ApiProperty({ description: '上传时间', example: '2025-06-05T12:00:00Z' })
  @Column()
  createdAt: Date;
}
