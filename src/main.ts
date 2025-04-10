// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(process.env.PORT ?? 3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000; // Lấy PORT từ .env hoặc mặc định 3000

  app.enableCors(); // Cho phép CORS (cấu hình chi tiết hơn nếu cần)
  app.setGlobalPrefix('api'); // Đặt tiền tố chung cho tất cả API routes là /api

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Chỉ giữ lại các thuộc tính có trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu (vd: string sang number)
      forbidNonWhitelisted: true, // Báo lỗi nếu có thuộc tính thừa trong request body
      transformOptions: {
        enableImplicitConversion: true, // Cho phép chuyển đổi ngầm định
      },
    }),
  );

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
