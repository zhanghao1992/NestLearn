import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局路由前缀
  app.setGlobalPrefix('api/v1');

  // 全局 DTO 校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剥离未定义的属性
      forbidNonWhitelisted: true, // 出现未定义属性直接报错
      transform: true, // 入参自动转型为 DTO 类型
    }),
  );

  // CORS - 允许前端域名访问
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Swagger API 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('团队任务协作平台接口文档')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  new Logger('Bootstrap').log(
    `🚀 API 运行于 http://localhost:${port}/api/v1`,
  );
  new Logger('Bootstrap').log(`📚 Swagger 文档: http://localhost:${port}/docs`);
}
void bootstrap();
