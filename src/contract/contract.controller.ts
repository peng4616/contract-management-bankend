import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { ContractService } from "./contract.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { Contract } from "./entities/contract.entity";
import { Attachment } from "./entities/attachment.entity";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { promises as fs, createReadStream } from "fs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import * as iconv from "iconv-lite";
import { ResponseDto, ErrorResponseDto } from "../common/dto/response.dto";
import { SearchContractDto } from "./dto/search-contract.dto";
import { Response } from "express";

// 定义 Swagger 标签为“合同管理”，便于在 Swagger UI 中分类显示
@ApiTags("合同管理")
// 声明 Swagger 使用的 DTO 模型，确保文档生成正确
@ApiExtraModels(ResponseDto, ErrorResponseDto, Contract, Attachment)
// 设置控制器路由前缀为 /contracts
@Controller("contracts")
// 应用 JWT 认证守卫，所有接口需携带有效的 Bearer Token
@UseGuards(JwtAuthGuard)
// 在 Swagger 中启用 Bearer 认证
@ApiBearerAuth()
export class ContractController {
  // 构造函数，注入 ContractService
  constructor(private readonly contractService: ContractService) {}

  // 创建新合同
  @Post()
  // Swagger 操作描述：创建新合同
  @ApiOperation({ summary: "创建新合同" })
  // 定义请求体为 CreateContractDto
  @ApiBody({ type: CreateContractDto })
  // 定义成功响应：201，包含合同数据
  @ApiResponse({
    status: 201,
    description: "合同创建成功",
    type: () => ResponseDto<Contract>,
  })
  // 定义错误响应：400，合同编号重复
  @ApiResponse({
    status: 400,
    description: "合同编号已存在",
    type: ErrorResponseDto,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  async create(
    @Body() createContractDto: CreateContractDto
  ): Promise<Contract> {
    // 调用服务层创建合同
    return this.contractService.create(createContractDto);
  }

  // 获取合同列表（支持搜索和分页）
  @Get()
  // Swagger 操作描述：获取合同列表
  @ApiOperation({ summary: "获取合同列表（支持搜索和分页）" })
  // 定义查询参数为 SearchContractDto
  @ApiQuery({ type: SearchContractDto })
  // 定义成功响应：200，包含合同列表和总数
  @ApiResponse({
    status: 200,
    description: "返回合同列表",
    type: () => ResponseDto,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：400，请求参数错误
  @ApiResponse({
    status: 400,
    description: "请求参数错误",
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() query: SearchContractDto
  ): Promise<ResponseDto<{ data: Contract[]; total: number }>> {
    // 调用服务层查询合同列表
    const result = await this.contractService.findAll(query);
    // 返回标准响应格式
    return {
      statusCode: 200,
      message: "查询成功",
      data: result,
    };
  }

  // 根据 ID 获取合同详情
  @Get(":id")
  // Swagger 操作描述：获取单个合同
  @ApiOperation({ summary: "根据 ID 获取合同详情" })
  // 定义路径参数：id
  @ApiParam({ name: "id", description: "合同 ID" })
  // 定义成功响应：200，包含合同详情
  @ApiResponse({
    status: 200,
    description: "返回合同详情",
    type: () => ResponseDto<Contract>,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，合同不存在
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  async findOne(@Param("id") id: string): Promise<Contract> {
    // 将字符串 id 转换为数字，调用服务层查询
    return this.contractService.findOne(+id);
  }

  // 更新合同信息
  @Put(":id")
  // Swagger 操作描述：更新合同
  @ApiOperation({ summary: "更新合同信息" })
  // 定义路径参数：id
  @ApiParam({ name: "id", description: "合同 ID" })
  // 定义请求体为 UpdateContractDto
  @ApiBody({ type: UpdateContractDto })
  // 定义成功响应：200，包含更新后的合同
  @ApiResponse({
    status: 200,
    description: "合同更新成功",
    type: () => ResponseDto<Contract>,
  })
  // 定义错误响应：400，合同编号重复
  @ApiResponse({
    status: 400,
    description: "合同编号已存在",
    type: ErrorResponseDto,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，合同不存在
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  async update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto
  ): Promise<Contract> {
    // 将字符串 id 转换为数字，调用服务层更新
    return this.contractService.update(+id, updateContractDto);
  }

  // 删除合同
  @Delete(":id")
  // Swagger 操作描述：删除合同
  @ApiOperation({ summary: "删除合同" })
  // 定义路径参数：id
  @ApiParam({ name: "id", description: "合同 ID" })
  // 定义成功响应：200，无数据返回
  @ApiResponse({
    status: 200,
    description: "合同删除成功",
    type: () => ResponseDto<null>,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，合同不存在
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  async remove(@Param("id") id: string): Promise<void> {
    // 将字符串 id 转换为数字，调用服务层删除
    return this.contractService.remove(+id);
  }

  // 审批合同
  @Put(":id/approve")
  // Swagger 操作描述：审批合同
  @ApiOperation({ summary: "审批合同" })
  // 定义路径参数：id
  @ApiParam({ name: "id", description: "合同 ID" })
  // 定义请求体：包含 status 字段
  @ApiBody({
    schema: { type: "object", properties: { status: { type: "string" } } },
  })
  // 定义成功响应：200，包含更新后的合同
  @ApiResponse({
    status: 200,
    description: "合同审批成功",
    type: () => ResponseDto<Contract>,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，合同不存在
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  async approve(
    @Param("id") id: string,
    @Body("status") status: string
  ): Promise<Contract> {
    // 将字符串 id 转换为数字，调用服务层审批
    return this.contractService.approve(+id, status);
  }

  // 为合同上传附件
  @Post(":id/attachments")
  // Swagger 操作描述：上传附件
  @ApiOperation({ summary: "为合同上传附件" })
  // 定义路径参数：id
  @ApiParam({ name: "id", description: "合同 ID" })
  // 定义请求为 multipart/form-data
  @ApiConsumes("multipart/form-data")
  // 定义请求体：包含 file 字段（二进制文件）
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  // 定义成功响应：201，包含附件信息
  @ApiResponse({
    status: 201,
    description: "附件上传成功",
    type: () => ResponseDto<Attachment>,
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，合同不存在
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  // 使用 FileInterceptor 拦截文件上传
  @UseInterceptors(
    FileInterceptor("file", {
      // 配置存储路径和文件名
      storage: diskStorage({
        destination: "./uploads", // 存储目录
        filename: (req, file, cb) => {
          // 解码中文文件名，确保正确处理
          const originalName = iconv.decode(
            Buffer.from(file.originalname, "binary"),
            "utf8"
          );
          const name = originalName.split(".").slice(0, -1).join("."); // 去掉扩展名
          const extension = extname(originalName); // 获取扩展名
          // 添加时间戳避免文件名冲突
          const timestamp = Date.now();
          const uniqueFileName = `${name}-${timestamp}${extension}`;
          // 将文件名编码为 UTF-8 保存
          const encodedFileName = iconv
            .encode(uniqueFileName, "utf8")
            .toString();
          cb(null, encodedFileName);
        },
      }),
      // 文件过滤，仅允许 PDF 和 Word 格式
      fileFilter: (req, file, cb) => {
        const decodedName = iconv.decode(
          Buffer.from(file.originalname, "binary"),
          "utf8"
        );
        if (file.mimetype.match(/\/(pdf|msword|docx)$/)) {
          cb(null, true);
        } else {
          cb(new Error("仅支持 PDF 和 Word 格式"), false);
        }
      },
      // 文件大小限制：10MB
      limits: { fileSize: 10 * 1024 * 1024 },
    })
  )
  async uploadAttachment(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Attachment> {
    // 将字符串 id 转换为数字，调用服务层上传附件
    return this.contractService.uploadAttachment(+id, file);
  }

  // 下载附件
  @Get("attachments/:attachmentId")
  // 再次声明 JWT 认证（确保独立接口也受保护）
  @UseGuards(JwtAuthGuard)
  // Swagger 操作描述：下载附件
  @ApiOperation({ summary: "下载附件" })
  // 定义路径参数：attachmentId
  @ApiParam({ name: "attachmentId", description: "附件 ID" })
  // 定义成功响应：200，返回文件流
  @ApiResponse({
    status: 200,
    description: "返回附件文件",
    content: { "application/octet-stream": {} },
  })
  // 定义错误响应：401，未授权
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  // 定义错误响应：404，附件不存在
  @ApiResponse({
    status: 404,
    description: "附件不存在",
    type: ErrorResponseDto,
  })
  async downloadAttachment(
    @Param("attachmentId") attachmentId: string,
    @Res() res: Response
  ): Promise<void> {
    // 获取附件信息
    const attachment = await this.contractService.getAttachment(+attachmentId);
    // 构造文件路径
    const filePath = join(process.cwd(), attachment.filePath);

    try {
      // 检查文件是否存在
      await fs.access(filePath);
    } catch {
      // 如果文件不存在，抛出 404 错误
      throw new NotFoundException("附件文件不存在");
    }

    // 设置响应头，指定文件类型和文件名（支持中文）
    res.set({
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
    });

    // 创建文件流并传输到客户端
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
