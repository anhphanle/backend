import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
// import { AttributesModule } from '../attributes/attributes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]), // Đăng ký Category entity
  ],
  // controllers: [],
  // providers: [],
  // exports: []
})
export class CategoriesModule {}
