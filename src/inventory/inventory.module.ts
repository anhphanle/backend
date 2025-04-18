import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryLog } from './entities/inventory-log.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { ProductsModule } from '../products/products.module'; // Import để đảm bảo ProductVariantRepository có sẵn? Không cần thiết nếu inject trực tiếp
import { UsersModule } from '../users/users.module'; // Import để đảm bảo UserRepository có sẵn? Không cần thiết nếu inject trực tiếp

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryLog, ProductVariant, User]), // Đăng ký các entity cần dùng
    // forwardRef(() => ProductsModule), // Chỉ cần nếu InventoryService gọi ProductsService
    // forwardRef(() => UsersModule), // Chỉ cần nếu InventoryService gọi UsersService
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService], // Export nếu cần dùng ở module khác (ví dụ: Order Module sau này)
})
export class InventoryModule {}
