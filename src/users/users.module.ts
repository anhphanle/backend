import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
// import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Đăng ký User entity
    // RolesModule // Ví dụ nếu cần inject RoleRepository vào UserService
  ],
  // controllers: [],
  // providers: [],
  // exports: []
})
export class UsersModule {}
