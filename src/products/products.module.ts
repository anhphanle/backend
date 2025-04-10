import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Promotion } from './entities/promotion.entity';
// import { CategoriesModule } from '../categories/categories.module'; // Chắc chắn cần sau này
// import { AttributesModule } from '../attributes/attributes.module'; // Chắc chắn cần sau này

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      Promotion, // Đăng ký tất cả entities liên quan đến Product
    ]),
    // CategoriesModule, // Sẽ import khi cần service
    // AttributesModule, // Sẽ import khi cần service
  ],
  // controllers: [],
  // providers: [],
  // exports: []
})
export class ProductsModule {}
