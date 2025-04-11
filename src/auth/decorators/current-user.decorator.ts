import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User; // User đã được gắn bởi JwtStrategy
    return data ? user?.[data] : user; // Trả về cả user hoặc chỉ 1 trường nếu data được truyền vào
  },
);
