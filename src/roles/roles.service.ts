import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

// DTO nếu cần tạo Role qua API
interface CreateRoleDto {
  name: string;
  description?: string;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findByName(name: string): Promise<Role | undefined> {
    const role = await this.roleRepository.findOneBy({ name });
    // Chuyển đổi null thành undefined nếu role là null
    return role ?? undefined; // <--- SỬA Ở ĐÂY
  }

  async findById(id: string): Promise<Role | undefined> {
    const role = await this.roleRepository.findOneBy({ id });
    // Chuyển đổi null thành undefined nếu role là null
    return role ?? undefined; // <--- SỬA Ở ĐÂY (Áp dụng tương tự)
  }

  // Hàm tạo Role (dùng cho seeding hoặc API nếu cần)
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException(
        `Role name "${createRoleDto.name}" already exists.`,
      );
    }
    const newRole = this.roleRepository.create(createRoleDto);
    try {
      return await this.roleRepository.save(newRole);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          `Role name "${createRoleDto.name}" already exists.`,
        );
      }
      throw new InternalServerErrorException('Failed to create role.');
    }
  }

  // Thêm các hàm khác nếu cần: findAll, update, delete...
}
