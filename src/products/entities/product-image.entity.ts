import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  @Index()
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true }) // Có thể NULL nếu là ảnh chung
  @Index()
  variantId?: string;

  @Column({ name: 'image_url', type: 'varchar', length: 1024, nullable: false })
  imageUrl: string;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText?: string;

  @Column({ name: 'is_thumbnail', type: 'boolean', default: false })
  @Index()
  isThumbnail: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

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
  @ManyToOne(() => Product, (product) => product.images, {
    nullable: false,
    onDelete: 'CASCADE',
  }) // Cascade đã định nghĩa ở Product
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.images, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Nếu xóa Variant, ảnh này trở thành ảnh chung của Product
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;
}
