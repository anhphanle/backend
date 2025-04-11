import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // (Tùy chọn) Ghi đè handleRequest để tùy chỉnh lỗi hoặc xử lý khác
  // handleRequest(err, user, info) {
  //   if (err || !user) {
  //     throw err || new UnauthorizedException('Invalid or expired token.');
  //   }
  //   return user;
  // }
}
