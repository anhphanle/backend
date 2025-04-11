import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // Tham số thứ 2 là options, ví dụ { usernameField: 'email' } nếu không dùng username
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Chỉ định dùng field 'email' thay vì 'username' mặc định
  }

  async validate(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return user;
  }
}
