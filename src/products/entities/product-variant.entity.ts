import { AttributeValue } from '../../attributes/entities/attribute-value.entity';
import { InventoryLog } from '../../inventory/entities/inventory-log.entity'; // Sẽ tạo sau
import { Promotion } from './promotion.entity'; // Sẽ tạo sau
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  @Index()
  productId: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  sku: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.0,
  })
  price: number; // TypeORM dùng number cho decimal

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number; // Tồn kho

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

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt?: Date;

  // --- Quan hệ ---
  @ManyToOne(() => Product, (product) => product.variants, {
    nullable: false,
    onDelete: 'CASCADE',
  }) // Cascade đã định nghĩa ở Product
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Quan hệ M-M với AttributeValue thông qua bảng variant_attribute_values
  @ManyToMany(() => AttributeValue, (value) => value.variants, {
    cascade: ['insert', 'update'],
  }) // cascade khi thêm/sửa variant
  @JoinTable({
    name: 'variant_attribute_values',
    joinColumn: { name: 'variant_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'attribute_value_id',
      referencedColumnName: 'id',
    },
  })
  attributeValues: AttributeValue[];

  @OneToMany(() => ProductImage, (image) => image.variant) // Một Variant có thể có nhiều Image riêng
  images: ProductImage[];

  @OneToMany(() => InventoryLog, (log) => log.productVariant) // Một Variant có nhiều Log tồn kho
  inventoryLogs: InventoryLog[];

  @OneToMany(() => Promotion, (promo) => promo.productVariant) // Một Variant có thể có nhiều Promotion
  promotions: Promotion[];
}
