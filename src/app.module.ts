import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module'; // Đã import
import { UsersModule } from './users/users.module'; // Đã import
import { CategoriesModule } from './categories/categories.module'; // Đã import
import { AttributesModule } from './attributes/attributes.module'; // Đã import
import { ProductsModule } from './products/products.module'; // Đã import
import { InventoryModule } from './inventory/inventory.module'; // Đã import
// Import các entity để TypeORM biết khi cấu hình datasource cho CLI (sẽ dùng cho migrations)
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Attribute } from './attributes/entities/attribute.entity';
import { AttributeValue } from './attributes/entities/attribute-value.entity';
import { Product } from './products/entities/product.entity';
import { ProductVariant } from './products/entities/product-variant.entity';
import { ProductImage } from './products/entities/product-image.entity';
import { Promotion } from './products/entities/promotion.entity';
import { InventoryLog } from './inventory/entities/inventory-log.entity';
import { dataSourceOptions } from '../data-source';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './database/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions, // Sử dụng các cấu hình từ data-source.ts
      autoLoadEntities: true, // Tự động load entities đã đăng ký qua forFeature
      synchronize: false, // !!! QUAN TRỌNG: Tắt synchronize khi dùng migrations !!!
    }),

    UsersModule,
    RolesModule,
    CategoriesModule,
    AttributesModule,
    ProductsModule,
    InventoryModule,
    AuthModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
