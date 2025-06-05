import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

// 用户注册 DTO
export class RegisterDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: "角色",
    example: "ADMIN",
    enum: ["ADMIN", "USER", "APPROVER"],
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
