import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('promotions')
@Check(`"end_date" > "start_date"`) // Ràng buộc CHECK
@Check(`"promotional_price" >= 0`)
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_variant_id', type: 'uuid', nullable: false })
  @Index()
  productVariantId: string;

  @Column({
    name: 'promotional_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  promotionalPrice: number;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: false })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: false })
  endDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // --- Quan hệ ---
  @ManyToOne(() => ProductVariant, (variant) => variant.promotions, {
    nullable: false,
    onDelete: 'CASCADE',
  }) // Xóa variant -> xóa promotion
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;
}

// Index phức hợp (đã có trong schema SQL, TypeORM sẽ tự tạo dựa trên các @Index riêng lẻ hoặc có thể định nghĩa phức tạp hơn nếu cần)
// @Index(['isActive', 'startDate', 'endDate']) // Có thể thêm index này nếu cần tối ưu query theo cả 3 cột
