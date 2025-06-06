import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 自动转换字符串到指定类型
      transformOptions: { enableImplicitConversion: true }, // 宽松转换
      forbidNonWhitelisted: true, // 禁止未定义的参数
      whitelist: true, // 过滤掉非DTO定义的字段
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 配置 Swagger
  const config = new DocumentBuilder()
    .setTitle("合同管理系统 API")
    .setDescription("合同管理系统的 RESTful API 文档")
    .setVersion("1.0")
    .addTag("Contracts", "合同相关操作")
    .addTag("Auth", "用户认证操作")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
