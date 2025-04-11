import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
// Import AuthModule nếu RolesGuard chưa được cung cấp global
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]), // Đăng ký Category entity với TypeORM
    // AuthModule // Import nếu cần thiết cho Guards
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], // Export service nếu module khác cần dùng (vd: ProductsModule)
})
export class CategoriesModule {}
