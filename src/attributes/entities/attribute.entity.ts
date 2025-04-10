import { Category } from '../../categories/entities/category.entity';
import { AttributeValue } from './attribute-value.entity'; // Sẽ tạo sau
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string; // e.g., 'Color', 'Size'

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
  @OneToMany(() => AttributeValue, (value) => value.attribute, {
    cascade: true,
  }) // Nếu xóa Attribute, xóa luôn Value (cascade)
  values: AttributeValue[];

  @ManyToMany(() => Category, (category) => category.attributes)
  // JoinTable được định nghĩa ở phía Category
  categories: Category[];
}
