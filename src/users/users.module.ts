import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
// import { UsersController } from './users.controller'; // Sẽ tạo controller sau nếu cần endpoint quản lý user
import { AuthModule } from '../auth/auth.module'; // Import AuthModule nếu có dependency vòng
import { Role } from '../roles/entities/role.entity'; // Import Role entity để inject RoleRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]), // Đăng ký cả User và Role Repository
    forwardRef(() => AuthModule), // Xử lý circular dependency với AuthModule
    // Import RolesModule nếu inject RolesService thay vì RoleRepository
    // forwardRef(() => RolesModule),
  ],
  controllers: [
    /* UsersController */
  ], // Thêm UsersController vào đây khi bạn tạo nó
  providers: [UsersService],
  exports: [UsersService], // Export UsersService để AuthModule có thể sử dụng
})
export class UsersModule {}
