import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

// 用户实体
@Entity()
export class User {
  @ApiProperty({ description: "用户 ID", example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: "用户名，唯一", example: "admin" })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: "密码（加密存储）", example: "hashed_password" })
  @Column()
  password: string;

  @ApiProperty({
    description: "角色",
    example: "ADMIN",
    enum: ["ADMIN", "USER", "APPROVER"],
  })
  @Column()
  role: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
