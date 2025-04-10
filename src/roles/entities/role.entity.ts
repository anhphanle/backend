import { User } from '../../users/entities/user.entity'; // Sẽ tạo sau
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('roles') // Tên bảng trong CSDL
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true }) // Đảm bảo tên vai trò là duy nhất
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string; // e.g., 'Admin', 'ProductManager'

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // --- Quan hệ ---
  @OneToMany(() => User, (user) => user.role) // Một Role có nhiều User
  users: User[];
}
