import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle("合同管理系统 API")
    .setDescription("合同管理系统的 RESTful API 文档")
    .setVersion("1.0")
    .addTag("Contracts", "合同相关操作")
    .addTag("Auth", "用户认证操作")
    .addBearerAuth() // 添加 Bearer Token 认证
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
