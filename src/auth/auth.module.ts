import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
// Import Guards sẽ tạo sau
// import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule), // Sử dụng forwardRef nếu có circular dependency
    PassportModule,
    JwtModule.registerAsync({
      // Cấu hình JWT bất đồng bộ để đọc từ ConfigService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '3600s'), // Mặc định 1 giờ nếu không có trong .env
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Đảm bảo ConfigModule được import
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy, // Khai báo LocalStrategy
    JwtStrategy, // Khai báo JwtStrategy
    // RolesGuard, // Khai báo RolesGuard sau khi tạo
  ],
  exports: [AuthService, JwtModule], // Export AuthService và JwtModule nếu cần dùng ở nơi khác
})
export class AuthModule {}
