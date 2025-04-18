import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity'; // Import entity liên quan
import { AttributeValue } from '../attributes/entities/attribute-value.entity'; // Import entity liên quan
// import { InventoryLog } from '../inventory/entities/inventory-log.entity'; // Sẽ import khi có InventoryModule
import { CategoriesModule } from '../categories/categories.module'; // Import Module liên quan
import { AttributesModule } from '../attributes/attributes.module'; // Import Module liên quan
// import { InventoryModule } from '../inventory/inventory.module'; // Sẽ import khi có InventoryModule
// import { AuthModule } from '../auth/auth.module'; // Nếu cần

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductImage,
      Category, // Cần để inject repository
      AttributeValue, // Cần để inject repository
      // InventoryLog, // Sẽ thêm sau
    ]),
    // forwardRef(() => AuthModule), // Nếu có circular dependency
    forwardRef(() => CategoriesModule), // Nếu CategoriesModule dùng ProductsService
    forwardRef(() => AttributesModule), // Nếu AttributesModule dùng ProductsService
    // forwardRef(() => InventoryModule), // Sẽ thêm sau
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export nếu cần
})
export class ProductsModule {}
