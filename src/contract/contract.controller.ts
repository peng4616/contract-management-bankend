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
import { ResponseDto, ErrorResponseDto } from "../common/dto/response.dto"; // 导入公共 DTO
import { SearchContractDto } from "./dto/search-contract.dto";
import { Response } from "express";

@ApiTags("Contracts")
@ApiExtraModels(ResponseDto, ErrorResponseDto, Contract, Attachment) // 声明 DTO
@Controller("contracts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  // 创建合同
  @Post()
  @ApiOperation({ summary: "创建新合同" })
  @ApiBody({ type: CreateContractDto })
  @ApiResponse({
    status: 201,
    description: "合同创建成功",
    type: () => ResponseDto<Contract>,
  })
  @ApiResponse({
    status: 400,
    description: "合同编号已存在",
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  create(@Body() createContractDto: CreateContractDto): Promise<Contract> {
    return this.contractService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: "获取合同列表（支持搜索和分页）" })
  @ApiQuery({ type: SearchContractDto })
  @ApiResponse({
    status: 200,
    description: "返回合同列表",
    type: () => ResponseDto,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 400,
    description: "请求参数错误",
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() query: SearchContractDto
  ): Promise<ResponseDto<{ data: Contract[]; total: number }>> {
    const result = await this.contractService.findAll(query);
    return {
      statusCode: 200,
      message: "查询成功",
      data: result,
    };
  }

  // 获取单个合同
  @Get(":id")
  @ApiOperation({ summary: "根据 ID 获取合同详情" })
  @ApiParam({ name: "id", description: "合同 ID" })
  @ApiResponse({
    status: 200,
    description: "返回合同详情",
    type: () => ResponseDto<Contract>,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  findOne(@Param("id") id: string): Promise<Contract> {
    return this.contractService.findOne(+id);
  }

  // 更新合同
  @Put(":id")
  @ApiOperation({ summary: "更新合同信息" })
  @ApiParam({ name: "id", description: "合同 ID" })
  @ApiBody({ type: UpdateContractDto })
  @ApiResponse({
    status: 200,
    description: "合同更新成功",
    type: () => ResponseDto<Contract>,
  })
  @ApiResponse({
    status: 400,
    description: "合同编号已存在",
    type: ErrorResponseDto,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto
  ): Promise<Contract> {
    return this.contractService.update(+id, updateContractDto);
  }

  // 删除合同
  @Delete(":id")
  @ApiOperation({ summary: "删除合同" })
  @ApiParam({ name: "id", description: "合同 ID" })
  @ApiResponse({
    status: 200,
    description: "合同删除成功",
    type: () => ResponseDto<null>,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  remove(@Param("id") id: string): Promise<void> {
    return this.contractService.remove(+id);
  }

  // 审批合同
  @Put(":id/approve")
  @ApiOperation({ summary: "审批合同" })
  @ApiParam({ name: "id", description: "合同 ID" })
  @ApiBody({
    schema: { type: "object", properties: { status: { type: "string" } } },
  })
  @ApiResponse({
    status: 200,
    description: "合同审批成功",
    type: () => ResponseDto<Contract>,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  approve(
    @Param("id") id: string,
    @Body("status") status: string,
  ): Promise<Contract> {
    return this.contractService.approve(+id, status);
  }

  // 上传附件
  @Post(":id/attachments")
  @ApiOperation({ summary: "为合同上传附件" })
  @ApiParam({ name: "id", description: "合同 ID" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "附件上传成功",
    type: () => ResponseDto<Attachment>,
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "合同不存在",
    type: ErrorResponseDto,
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          // 解码中文文件名，确保正确处理
          const originalName = iconv.decode(
            Buffer.from(file.originalname, "binary"),
            "utf8",
          );
          const name = originalName.split(".").slice(0, -1).join("."); // 去掉扩展名
          const extension = extname(originalName); // 获取扩展名
          // 添加时间戳避免冲突
          const timestamp = Date.now();
          const uniqueFileName = `${name}-${timestamp}${extension}`;
          // 将文件名编码为UTF-8保存到文件系统
          const encodedFileName = iconv
            .encode(uniqueFileName, "utf8")
            .toString();
          cb(null, encodedFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // 确保文件名的MIME类型正确处理
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
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
    })
  )
  uploadAttachment(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Attachment> {
    return this.contractService.uploadAttachment(+id, file);
  }

  // 下载附件
  @Get("attachments/:attachmentId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "下载附件" })
  @ApiParam({ name: "attachmentId", description: "附件 ID" })
  @ApiResponse({
    status: 200,
    description: "返回附件文件",
    content: { "application/octet-stream": {} },
  })
  @ApiResponse({ status: 401, description: "未授权", type: ErrorResponseDto })
  @ApiResponse({
    status: 404,
    description: "附件不存在",
    type: ErrorResponseDto,
  })
  async downloadAttachment(
    @Param("attachmentId") attachmentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const attachment = await this.contractService.getAttachment(+attachmentId);
    const filePath = join(process.cwd(), attachment.filePath);

    try {
      await fs.access(filePath); // 检查文件是否存在
    } catch {
      throw new NotFoundException("附件文件不存在");
    }

    res.set({
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
    });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }
}
