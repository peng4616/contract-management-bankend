import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Attachment } from "./attachment.entity";
import { ApiProperty } from "@nestjs/swagger";

// 合同实体
@Entity()
export class Contract {
  @ApiProperty({ description: "合同 ID", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "合同编号，唯一", example: "CONTRACT-001" })
  @Column({ unique: true })
  contractNo: string;

  @ApiProperty({ description: "合同标题", example: "销售合同" })
  @Column()
  title: string;

  @ApiProperty({ description: "甲方名称", example: "公司 A" })
  @Column()
  partyA: string;

  @ApiProperty({ description: "乙方名称", example: "公司 B" })
  @Column()
  partyB: string;

  @ApiProperty({ description: "合同金额（万元）", example: 100.0 })
  @Column("decimal", { precision: 15, scale: 2 })
  amount: number;

  @ApiProperty({
    description: "合同状态",
    example: "DRAFT",
    enum: ["DRAFT", "PENDING", "APPROVED", "ARCHIVED"],
  })
  @Column()
  status: string;

  @ApiProperty({ description: "创建时间", example: "2025-06-05T12:00:00Z" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: "更新时间", example: "2025-06-05T12:00:00Z" })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: "合同附件", type: () => [Attachment] })
  @OneToMany(() => Attachment, (attachment) => attachment.contract)
  attachments: Attachment[]; // 新增：与附件的一对多关系
}
