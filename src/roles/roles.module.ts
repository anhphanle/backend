import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RolesService } from './roles.service';
// Import RolesController nếu có

@Module({
  imports: [TypeOrmModule.forFeature([Role])], // Đăng ký Role entity/repository
  // controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService, TypeOrmModule], // Export Service VÀ TypeOrmModule để module khác inject Repository
})
export class RolesModule {}
