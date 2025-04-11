import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    this.logger.log(`Attempting to validate user: ${email}`); // Log email đầu vào
    const user = await this.usersService.findByEmail(email, true); // Lấy user kèm hash

    // --- THÊM LOGGING CHI TIẾT ---
    this.logger.debug(
      `User object retrieved for ${email}: ${JSON.stringify(user)}`,
    ); // Log toàn bộ object user
    this.logger.debug(
      `Password input received for ${email} (type: ${typeof pass}): ${pass ? '[exists]' : pass}`,
    ); // Log kiểu và sự tồn tại của pass
    if (user) {
      this.logger.debug(
        `User passwordHash from DB (type: ${typeof user.passwordHash}): ${user.passwordHash ? '[exists]' : user.passwordHash}`,
      ); // Log kiểu và sự tồn tại của hash
    }
    // --- KẾT THÚC LOGGING ---

    // Kiểm tra kỹ lưỡng hơn trước khi gọi compare
    if (
      user &&
      user.passwordHash &&
      typeof pass === 'string' &&
      pass.length > 0
    ) {
      this.logger.log(`Proceeding to bcrypt.compare for ${email}`);
      try {
        // Gọi bcrypt.compare trong try...catch để bắt lỗi cụ thể nếu có
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
          this.logger.log(`Password matched successfully for ${email}.`);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { passwordHash, ...result } = user;
          return result; // Trả về user nếu hợp lệ
        } else {
          this.logger.warn(`Password mismatch for email: ${email}`);
        }
      } catch (compareError) {
        // Log lỗi cụ thể từ bcrypt.compare
        this.logger.error(
          `bcrypt.compare error for email ${email}:`,
          compareError,
        );
        return null; // Trả về null nếu có lỗi khi so sánh
      }
    } else {
      // Log lý do tại sao không thể thực hiện compare
      this.logger.warn(
        `Skipping bcrypt.compare for ${email}. Reason: User found=${!!user}, Hash exists=${!!user?.passwordHash}, Password valid=${typeof pass === 'string' && pass.length > 0}`,
      );
    }

    this.logger.warn(`Failed login attempt for email: ${email}`);
    return null; // Trả về null nếu không hợp lệ hoặc có lỗi
  }

  async login(user: Omit<User, 'passwordHash'>) {
    // User đã được validate bởi LocalStrategy, chỉ cần tạo token
    // Cần lấy role name từ user.role (TypeORM sẽ load relationship nếu cần)
    await user.role; // Đảm bảo role đã được load (nếu chưa eager load)

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role.name, // Lấy tên role từ object Role liên kết
    };
    this.logger.log(`User logged in: ${user.email}, Role: ${user.role.name}`);
    return {
      access_token: this.jwtService.sign(payload), // Tạo JWT
      user: {
        // Trả về thông tin user cơ bản (không nhạy cảm)
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  // Hàm register/tạo user có thể đặt ở đây hoặc UsersService
  // async register(createUserDto: CreateUserDto): Promise<User> {
  //    // Gọi usersService.create
  // }
}
