import { Role } from '../../roles/entities/role.entity';
import { InventoryLog } from '../../inventory/entities/inventory-log.entity'; // Sẽ tạo sau
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
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Index({ unique: true }) // Đảm bảo email là duy nhất
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
  }) // select: false để không trả về password hash khi query thông thường
  passwordHash: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: false })
  roleId: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @Index() // Index cột is_active
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

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true }) // Cho soft delete
  @Index() // Index cột deleted_at
  deletedAt?: Date;

  // --- Quan hệ ---
  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    onDelete: 'RESTRICT',
  }) // Nhiều User thuộc một Role
  @JoinColumn({ name: 'role_id' }) // Chỉ định cột khóa ngoại
  role: Role;

  @OneToMany(() => InventoryLog, (log) => log.user) // Một User có thể tạo nhiều InventoryLog
  inventoryLogs: InventoryLog[];
}
