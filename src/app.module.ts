// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường có sẵn toàn ứng dụng
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT')!, 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Tự động load entities
        synchronize: true, // Chỉ dùng cho development, tự động tạo schema DB. Production sẽ dùng migrations.
        // ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false, // Cấu hình SSL nếu cần cho Production
      }),
      inject: [ConfigService],
    }),
    // Thêm các Feature Modules khác ở đây khi tạo
    // ví dụ: AuthModule, UsersModule, ProductsModule...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
