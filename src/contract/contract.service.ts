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
import { User } from "../user/user.entity"; // 假设 User 实体在 user 目录下

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>
  ) {}

  // 创建合同
  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const existingContract = await this.contractRepository.findOne({
      where: { contractNo: createContractDto.contractNo },
    });
    if (existingContract) {
      throw new BadRequestException(
        `合同编号 ${createContractDto.contractNo} 已存在`
      );
    }
    const contract = this.contractRepository.create(createContractDto);
    return this.contractRepository.save(contract);
  }

  // 查询所有合同
  async findAll(
    query: SearchContractDto
  ): Promise<{ data: Contract[]; total: number }> {
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

    this.logger.debug(`查询参数: ${JSON.stringify(query)}`);

    const queryBuilder = this.contractRepository
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.attachments", "attachments")
      .where("1 = 1");

    if (title) {
      queryBuilder.andWhere("contract.title LIKE :title", {
        title: `%${title}%`,
      });
    }
    if (status) {
      queryBuilder.andWhere("contract.status = :status", { status });
    }
    if (minAmount !== undefined && maxAmount !== undefined) {
      queryBuilder.andWhere(
        "contract.amount BETWEEN :minAmount AND :maxAmount",
        { minAmount, maxAmount }
      );
    } else if (minAmount !== undefined) {
      queryBuilder.andWhere("contract.amount >= :minAmount", { minAmount });
    } else if (maxAmount !== undefined) {
      queryBuilder.andWhere("contract.amount <= :maxAmount", { maxAmount });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "contract.createdAt BETWEEN :startDate AND :endDate",
        { startDate, endDate }
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    try {
      const [data, total] = await queryBuilder.getManyAndCount();
      return { data, total };
    } catch (error) {
      this.logger.error(`查询失败: ${error.message}`, error.stack);
      throw new BadRequestException("查询合同失败");
    }
  }

  // 根据 ID 查询合同
  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ["attachments"],
    });
    if (!contract) throw new NotFoundException("合同不存在");
    return contract;
  }

  // 更新合同
  async update(
    id: number,
    updateContractDto: UpdateContractDto
  ): Promise<Contract> {
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
    await this.contractRepository.update(id, updateContractDto);
    return this.findOne(id);
  }

  // 删除合同
  async remove(id: number): Promise<void> {
    await this.contractRepository.delete(id);
  }

  // 审批合同
  async approve(id: number, status: string): Promise<Contract> {
    await this.contractRepository.update(id, { status });
    return this.findOne(id);
  }

  // 上传附件
  async uploadAttachment(
    contractId: number,
    file: Express.Multer.File
  ): Promise<Attachment> {
    const contract = await this.findOne(contractId);
    const uploadDir = join(__dirname, "..", "..", "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    // 解码原始文件名以正确存储中文
    const originalName = iconv.decode(
      Buffer.from(file.originalname, "binary"),
      "utf8"
    );
    const attachment = this.attachmentRepository.create({
      fileName: originalName,
      filePath: join("uploads", file.filename), // 实际存储路径，含时间戳
      mimeType: file.mimetype,
      fileSize: file.size,
      contract,
      createdAt: new Date(),
    });
    return this.attachmentRepository.save(attachment);
  }

  // 获取附件信息
  async getAttachment(id: number, user?: User): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ["contract", "contract.createdBy"],
    });
    if (!attachment) throw new NotFoundException("附件不存在");

    // 权限验证
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
