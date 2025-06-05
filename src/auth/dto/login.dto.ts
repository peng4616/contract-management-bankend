import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

// 用户登录 DTO
export class LoginDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string;
}
