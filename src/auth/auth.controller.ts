import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 用户注册
  @Post("register")
  @ApiOperation({ summary: "用户注册" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "注册成功", type: RegisterDto })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // 用户登录
  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "登录成功，返回 JWT", type: Object })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
