import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
} from "@nestjs/swagger";
import { ResponseDto, ErrorResponseDto } from "../common/dto/response.dto"; // 导入公共 DTO

@ApiTags("Auth")
@ApiExtraModels(ResponseDto, ErrorResponseDto, RegisterDto) // 声明 DTO
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 用户注册
  @Post("register")
  @ApiOperation({ summary: "用户注册" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "注册成功",
    type: () => ResponseDto<RegisterDto>,
  })
  @ApiResponse({
    status: 400,
    description: "用户名已存在",
    type: ErrorResponseDto,
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // 用户登录
  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "登录成功，返回 JWT",
    type: () => ResponseDto<{ accessToken: string }>,
  })
  @ApiResponse({
    status: 401,
    description: "用户名或密码错误",
    type: ErrorResponseDto,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
