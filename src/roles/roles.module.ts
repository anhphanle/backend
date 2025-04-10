import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]), // Đăng ký Role entity
  ],
  // controllers: [], // Sẽ thêm sau
  // providers: [], // Sẽ thêm sau
  // exports: [] // Sẽ thêm sau nếu cần
})
export class RolesModule {}
