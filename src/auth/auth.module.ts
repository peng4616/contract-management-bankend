import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User } from "../user/user.entity";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 注册用户实体
    JwtModule.register({
      secret: "your_jwt_secret", // JWT 密钥（生产环境应使用环境变量）
      signOptions: { expiresIn: "1h" }, // 令牌有效期
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy], // 导出以供其他模块使用
})
export class AuthModule {}
