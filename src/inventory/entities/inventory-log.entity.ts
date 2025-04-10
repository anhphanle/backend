import { User } from '../../users/entities/user.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Định nghĩa kiểu Enum
export enum InventoryLogReason {
  MANUAL_STOCK_IN = 'Manual Stock In',
  MANUAL_STOCK_OUT = 'Manual Stock Out',
  INITIAL_STOCK = 'Initial Stock',
  SALE_ADJUSTMENT = 'Sale Adjustment',
  RETURN_STOCK = 'Return Stock',
  INVENTORY_COUNT_ADJUSTMENT = 'Inventory Count Adjustment',
  TRANSFER_IN = 'Transfer In',
  TRANSFER_OUT = 'Transfer Out',
  DAMAGE_LOSS = 'Damage/Loss',
}

@Entity('inventory_logs')
export class InventoryLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' }) // Dùng auto-increment BigInt
  id: number; // Hoặc string nếu bạn muốn giữ nhất quán UUID, nhưng BIGSERIAL thường dùng cho log

  @Column({ name: 'user_id', type: 'uuid', nullable: true }) // NULL nếu hệ thống tự động
  @Index()
  userId?: string;

  @Column({ name: 'product_variant_id', type: 'uuid', nullable: false })
  @Index()
  productVariantId: string;

  @Column({ name: 'change_quantity', type: 'int', nullable: false })
  changeQuantity: number; // Số lượng thay đổi (+ hoặc -)

  @Column({ name: 'new_quantity', type: 'int', nullable: false })
  newQuantity: number; // Số lượng tồn kho sau khi thay đổi

  @Column({
    type: 'enum',
    enum: InventoryLogReason,
    nullable: false,
  })
  @Index()
  reason: InventoryLogReason;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index()
  createdAt: Date;

  // --- Quan hệ ---
  @ManyToOne(() => User, (user) => user.inventoryLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Giữ log nếu User bị xóa
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => ProductVariant, (variant) => variant.inventoryLogs, {
    nullable: false,
    onDelete: 'RESTRICT',
  }) // Không cho xóa Variant nếu còn Log
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;
}
