import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { Attachment } from './entities/attachment.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {}

  // 创建合同
  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const contract = this.contractRepository.create(createContractDto);
    return this.contractRepository.save(contract);
  }

  // 查询所有合同（包含附件）
  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({ relations: ['attachments'] });
  }

  // 根据 ID 查询合同（包含附件）
  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['attachments'],
    });
    if (!contract) throw new NotFoundException('合同不存在');
    return contract;
  }

  // 更新合同
  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
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
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const contract = await this.findOne(contractId);
    if (!contract) throw new NotFoundException('合同不存在');

    // 确保上传目录存在
    const uploadDir = join(__dirname, '..', '..', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 保存附件元数据
    const attachment = this.attachmentRepository.create({
      fileName: file.originalname,
      filePath: join('uploads', file.filename),
      mimeType: file.mimetype,
      fileSize: file.size,
      contract,
      createdAt: new Date(),
    });

    return this.attachmentRepository.save(attachment);
  }

  // 获取附件信息
  async getAttachment(id: number): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id },
      relations: ['contract'],
    });
    if (!attachment) throw new NotFoundException('附件不存在');
    return attachment;
  }
}
