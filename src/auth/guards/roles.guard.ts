import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { User } from '../../users/entities/user.entity'; // Import User entity

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy các role yêu cầu từ metadata (@Roles decorator)
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Ưu tiên metadata ở cấp method
        context.getClass(), // Sau đó mới đến metadata ở cấp class
      ],
    );

    // Nếu không có @Roles decorator -> cho phép truy cập (hoặc có thể mặc định là cấm)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Hoặc false nếu muốn mặc định tất cả route cần role trừ khi được chỉ định
    }

    // Lấy thông tin user từ request (đã được JwtAuthGuard/JwtStrategy gắn vào)
    const request = context.switchToHttp().getRequest();
    const user = request.user as User; // User đã được gắn bởi JwtStrategy

    // Kiểm tra user tồn tại và có role không
    if (!user || !user.role) {
      return false;
    }

    // Kiểm tra xem role của user có nằm trong danh sách các role yêu cầu không
    // Lưu ý: user.role là object Role, cần lấy user.role.name
    return requiredRoles.some((role) => user.role.name === role);
  }
}
