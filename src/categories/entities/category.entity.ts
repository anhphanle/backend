import { Attribute } from '../../attributes/entities/attribute.entity'; // Sẽ tạo sau
import { Product } from '../../products/entities/product.entity'; // Sẽ tạo sau
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  @Index() // Index cột parent_id
  parentId: string | null;

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
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Tự tham chiếu: Một Category có một Parent
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent) // Tự tham chiếu: Một Category có nhiều Children
  children: Category[];

  @OneToMany(() => Product, (product) => product.category) // Một Category có nhiều Product
  products: Product[];

  // Quan hệ M-M với Attributes thông qua bảng category_attributes
  @ManyToMany(() => Attribute, (attribute) => attribute.categories)
  @JoinTable({
    name: 'category_attributes', // Tên bảng trung gian
    joinColumn: { name: 'category_id', referencedColumnName: 'id' }, // Khóa ngoại trỏ về Category
    inverseJoinColumn: { name: 'attribute_id', referencedColumnName: 'id' }, // Khóa ngoại trỏ về Attribute
  })
  attributes: Attribute[];
}
