import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLog } from './entities/inventory-log.entity';
// import { UsersModule } from '../users/users.module'; // Cần để lấy user ID
// import { ProductsModule } from '../products/products.module'; // Cần để lấy variant ID

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryLog]), // Đăng ký InventoryLog entity
    // UsersModule,
    // ProductsModule
  ],
  // controllers: [],
  // providers: [],
  // exports: []
})
export class InventoryModule {}
