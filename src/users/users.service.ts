import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
// Import UpdateUserDto nếu cần
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity'; // Import Role để kiểm tra khóa ngoại
// Import RolesService nếu cần kiểm tra Role tồn tại (optional, DB constraint sẽ xử lý)
// import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role) // Inject RoleRepository để kiểm tra role tồn tại
    private readonly roleRepository: Repository<Role>,
    // Inject RolesService nếu muốn dùng logic của nó thay vì RoleRepository trực tiếp
    // @Inject(forwardRef(() => RolesService)) private rolesService: RolesService
  ) {}

  async findByEmail(
    email: string,
    selectPassword = false,
  ): Promise<User | undefined> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role') // Load thông tin role kèm theo
      .where('user.email = :email', { email });

    if (selectPassword) {
      queryBuilder.addSelect('user.passwordHash'); // Chỉ chọn password hash nếu cần
    }

    const user = await queryBuilder.getOne(); // getOne() trả về User | null
    // Chuyển đổi null thành undefined
    return user ?? undefined; // <--- SỬA Ở ĐÂY
  }

  async findById(id: string): Promise<User | undefined> {
    // findOne trả về User | null
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    // Chuyển đổi null thành undefined
    return user ?? undefined; // <--- SỬA Ở ĐÂY
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, roleId, ...userData } = createUserDto;

    // 1. Kiểm tra Email đã tồn tại chưa
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException(`Email "${email}" already exists.`);
    }

    // 2. Kiểm tra RoleId có hợp lệ không (optional, DB constraint cũng sẽ bắt lỗi)
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found.`);
    }

    // 3. Hash mật khẩu
    const saltRounds = 10; // Số vòng lặp salt, 10-12 là phổ biến
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Error hashing password.');
    }

    // 4. Tạo đối tượng User mới
    const newUser = this.userRepository.create({
      ...userData,
      email,
      passwordHash: hashedPassword,
      roleId: roleId, // Gán roleId
      role: role, // Có thể gán cả object role nếu cần
      isActive: userData.isActive !== undefined ? userData.isActive : true, // Gán giá trị isActive hoặc mặc định true
    });

    // 5. Lưu vào CSDL
    try {
      const savedUser = await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = savedUser; // Loại bỏ password hash khỏi kết quả trả về
      return result;
    } catch (error) {
      // Bắt lỗi ràng buộc duy nhất (unique constraint) phòng trường hợp race condition
      if (error.code === '23505') {
        // Mã lỗi unique_violation của PostgreSQL
        throw new ConflictException(`Email "${email}" already exists.`);
      } else if (error.code === '23503') {
        // Mã lỗi foreign_key_violation
        throw new NotFoundException(
          `Role with ID "${roleId}" not found or invalid.`,
        );
      }
      throw new InternalServerErrorException('Failed to create user.'); // Lỗi chung
    }
  }

  // --- Thêm các phương thức khác nếu cần ---
  // async findAll(): Promise<User[]> { ... }
  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> { ... }
  // async remove(id: string): Promise<void> { ... } // Có thể là soft delete
}
