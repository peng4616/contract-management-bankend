import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractService } from "./contract.service";
import { ContractController } from "./contract.controller";
import { Contract } from "./entities/contract.entity";
import { Attachment } from "./entities/attachment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Attachment])], // 注册合同和附件实体
  controllers: [ContractController],
  providers: [ContractService],
})
export class ContractModule {}
