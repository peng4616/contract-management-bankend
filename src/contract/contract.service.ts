import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contract } from "./entities/contract.entity";
import { Attachment } from "./entities/attachment.entity";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import * as iconv from "iconv-lite";
import { SearchContractDto } from "./dto/search-contract.dto";
import { User } from "../user/user.entity";

// 声明服务为可注入，Nest.js 依赖注入系统可使用
@Injectable()
export class ContractService {
  // 创建日志实例，用于记录服务层的日志
  private readonly logger = new Logger(ContractService.name);

  // 构造函数，注入合同和附件的数据仓库
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>, // 合同实体仓库
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment> // 附件实体仓库
  ) {}

  // 创建新合同
  async create(createContractDto: CreateContractDto): Promise<Contract> {
    // 检查合同编号是否已存在
    const existingContract = await this.contractRepository.findOne({
      where: { contractNo: createContractDto.contractNo },
    });
    if (existingContract) {
      // 如果编号重复，抛出 400 错误
      throw new BadRequestException(
        `合同编号 ${createContractDto.contractNo} 已存在`
      );
    }
    // 创建合同实体
    const contract = this.contractRepository.create(createContractDto);
    // 保存合同到数据库并返回
    return this.contractRepository.save(contract);
  }

  // 查询合同列表（支持搜索和分页）
  async findAll(
    query: SearchContractDto
  ): Promise<{ data: Contract[]; total: number }> {
    // 解析查询参数
    const {
      title,
      status,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    // 记录查询参数日志，便于调试
    this.logger.debug(`查询参数: ${JSON.stringify(query)}`);

    // 创建查询构造器，关联附件
    const queryBuilder = this.contractRepository
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.attachments", "attachments")
      .where("1 = 1"); // 占位条件，便于动态添加

    // 按标题模糊搜索
    if (title) {
      queryBuilder.andWhere("contract.title LIKE :title", {
        title: `%${title}%`,
      });
    }
    // 按状态精确匹配
    if (status) {
      queryBuilder.andWhere("contract.status = :status", { status });
    }
    // 按金额范围过滤
    if (minAmount !== undefined && maxAmount !== undefined) {
      queryBuilder.andWhere(
        "contract.amount BETWEEN :minAmount AND :maxAmount",
        {
          minAmount,
          maxAmount,
        }
      );
    } else if (minAmount !== undefined) {
      queryBuilder.andWhere("contract.amount >= :minAmount", { minAmount });
    } else if (maxAmount !== undefined) {
      queryBuilder.andWhere("contract.amount <= :maxAmount", { maxAmount });
    }
    // 按创建时间范围过滤
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "contract.createdAt BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        }
      );
    }

    // 设置分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    try {
      // 执行查询，返回合同列表和总数
      const [data, total] = await queryBuilder.getManyAndCount();
      return { data, total };
    } catch (error) {
      // 记录错误日志并抛出 400 错误
      this.logger.error(`查询失败: ${error.message}`, error.stack);
      throw new BadRequestException("查询合同失败");
    }
  }

  // 根据 ID 查询单个合同
  async findOne(id: number): Promise<Contract> {
    // 查询合同，包含附件关联
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["attachments"],
    });
    // 如果合同不存在，抛出 404 错误
    if (!contract) throw new NotFoundException("合同不存在");
    return contract;
  }

  // 更新合同信息
  async update(
    id: number,
    updateContractDto: UpdateContractDto
  ): Promise<Contract> {
    // 如果更新了合同编号，检查是否重复
    if (updateContractDto.contractNo) {
      const existingContract = await this.contractRepository.findOne({
        where: { contractNo: updateContractDto.contractNo },
      });
      if (existingContract && existingContract.id !== id) {
        throw new BadRequestException(
          `合同编号 ${updateContractDto.contractNo} 已存在`
        );
      }
    }
    // 更新合同
    await this.contractRepository.update(id, updateContractDto);
    // 返回更新后的合同
    return this.findOne(id);
  }

  // 删除合同
  async remove(id: number): Promise<void> {
    // 删除指定 ID 的合同
    await this.contractRepository.delete(id);
  }

  // 审批合同
  async approve(id: number, status: string): Promise<Contract> {
    // 更新合同状态
    await this.contractRepository.update(id, { status });
    // 返回更新后的合同
    return this.findOne(id);
  }

  // 上传附件
  async uploadAttachment(
    contractId: number,
    file: Express.Multer.File
  ): Promise<Attachment> {
    // 确认合同存在
    const contract = await this.findOne(contractId);
    // 设置上传目录
    const uploadDir = join(__dirname, "..", "..", "uploads");
    // 如果目录不存在，创建目录
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    // 解码文件名以支持中文
    const originalName = iconv.decode(
      Buffer.from(file.originalname, "binary"),
      "utf8"
    );
    // 创建附件实体
    const attachment = this.attachmentRepository.create({
      fileName: originalName,
      filePath: join("uploads", file.filename), // 存储路径，含时间戳
      mimeType: file.mimetype,
      fileSize: file.size,
      contract,
      createdAt: new Date(),
    });
    // 保存附件到数据库并返回
    return this.attachmentRepository.save(attachment);
  }

  // 获取附件信息
  async getAttachment(id: number, user?: User): Promise<Attachment> {
    // 查询附件，包含合同和创建者关联
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ["contract", "contract.createdBy"],
    });
    // 如果附件不存在，抛出 404 错误
    if (!attachment) throw new NotFoundException("附件不存在");

    // 权限验证：非管理员且非合同创建者无权下载
    if (
      user &&
      user.role !== "ADMIN" &&
      attachment.contract.createdBy?.id !== user.id
    ) {
      throw new ForbiddenException("无权下载该附件");
    }

    return attachment;
  }
}
