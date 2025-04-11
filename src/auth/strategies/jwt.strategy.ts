import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common'; // Thêm InternalServerErrorException nếu dùng getOrThrow
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Sử dụng getOrThrow để đảm bảo secret tồn tại và là string
    // getOrThrow sẽ ném lỗi nếu JWT_SECRET không được đặt trong .env
    const secret = configService.getOrThrow<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Truyền giá trị secret đã được đảm bảo là string
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Tìm user trong DB bằng ID từ payload
    const user = await this.usersService.findById(payload.sub);

    // Kiểm tra user tồn tại và còn active
    if (!user) {
      // Log lỗi chi tiết hơn có thể hữu ích ở đây
      // console.error(`JWT Validation Error: User with id ${payload.sub} not found.`);
      throw new UnauthorizedException('User associated with token not found.');
    }
    if (!user.isActive) {
      // console.error(`JWT Validation Error: User ${user.email} is inactive.`);
      throw new UnauthorizedException('User account is inactive.');
    }

    // Passport sẽ tự động gắn đối tượng user này vào request.user
    // Không cần loại bỏ passwordHash thủ công ở đây nữa,
    // vì `findById` đã load `relations: ['role']` và entity User có `select: false` cho passwordHash.
    return user;
  }
}
