import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractModule } from './contract/contract.module'; // 确保路径正确

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3307,
      username: 'root',
      password: 'ninglupeng', // 替换为您的数据库密码
      database: 'contract_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境下自动同步数据库结构（生产环境禁用）
    }),
    ContractModule,
  ],
})
export class AppModule {}
