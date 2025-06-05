import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // 导入 Swagger 模块

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // 启用 DTO 验证

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle('合同管理系统 API') // API 文档标题
    .setDescription('合同管理系统的 RESTful API 文档') // API 描述
    .setVersion('1.0') // API 版本
    .addTag('Contracts', '合同相关操作') // 添加标签，用于分组 API
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 设置 Swagger 访问路径为 /api

  await app.listen(3000); // 监听 3000 端口
}
bootstrap();
