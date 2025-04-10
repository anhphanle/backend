import { ProductVariant } from '../../products/entities/product-variant.entity'; // Sẽ tạo sau
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  ManyToMany,
} from 'typeorm';
import { Attribute } from './attribute.entity';

@Entity('attribute_values')
@Unique(['attributeId', 'value']) // Ràng buộc UNIQUE(attribute_id, value)
export class AttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_id', type: 'uuid', nullable: false })
  @Index()
  attributeId: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  value: string; // e.g., 'Red', 'XL'

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
  @ManyToOne(() => Attribute, (attribute) => attribute.values, {
    nullable: false,
    onDelete: 'CASCADE',
  }) // Cascade đã định nghĩa ở Attribute
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  // Quan hệ M-M với ProductVariant thông qua bảng variant_attribute_values
  @ManyToMany(() => ProductVariant, (variant) => variant.attributeValues)
  // JoinTable sẽ định nghĩa ở ProductVariant
  variants: ProductVariant[];
}
