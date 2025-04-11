import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard'; // Sẽ tạo guard này
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Sẽ tạo guard này
import { LoginDto } from './dto/login.dto'; // Tạo DTO này
import { CurrentUser } from './decorators/current-user.decorator'; // Sẽ tạo decorator này
import { User } from '../users/entities/user.entity';

@Controller('auth') // Prefix chung là /api/auth
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/login
  @UseGuards(LocalAuthGuard) // Sử dụng LocalAuthGuard để kích hoạt LocalStrategy
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // loginDto chỉ để Swagger/Validation, thông tin lấy từ req.user
    // LocalAuthGuard đã chạy validate và gắn user vào req.user nếu thành công
    return this.authService.login(req.user); // Gọi service login để tạo token
  }

  // GET /api/auth/profile
  @UseGuards(JwtAuthGuard) // Sử dụng JwtAuthGuard để bảo vệ route này
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    // Sử dụng decorator tùy chỉnh để lấy user
    // JwtAuthGuard đã chạy JwtStrategy, validate token và gắn user vào request
    // Loại bỏ thông tin nhạy cảm trước khi trả về
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, deletedAt, ...profile } = user;
    return profile;
  }

  // (Tùy chọn) Endpoint đăng ký (nếu cần)
  // @Post('register')
  // async register(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.register(createUserDto);
  // }
}
