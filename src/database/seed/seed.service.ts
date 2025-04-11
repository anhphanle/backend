import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../../roles/roles.service';
import { UsersService } from '../../users/users.service';
import { RoleEnum } from '../../roles/roles.enum';
import { Role } from '../../roles/entities/role.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  // Hàm này sẽ tự động chạy khi module được khởi tạo
  async onModuleInit() {
    this.logger.log('Starting database seeding...');
    await this.seedRoles();
    await this.seedAdminUser();
    this.logger.log('Database seeding finished.');
  }

  private async seedRoles(): Promise<{ adminRole?: Role; otherRoles: Role[] }> {
    this.logger.log('Seeding roles...');
    const rolesToSeed = Object.values(RoleEnum); // Lấy tất cả giá trị từ Enum
    const createdRoles: Role[] = [];
    let foundAdminRole: Role | undefined;

    for (const roleName of rolesToSeed) {
      try {
        let role = await this.rolesService.findByName(roleName);
        if (!role) {
          this.logger.log(`Role "${roleName}" not found. Creating...`);
          role = await this.rolesService.create({
            name: roleName,
            description: `${roleName} role`, // Mô tả đơn giản
          });
          this.logger.log(`Role "${roleName}" created successfully.`);
          createdRoles.push(role);
        } else {
          this.logger.log(`Role "${roleName}" already exists.`);
        }
        if (role.name === RoleEnum.Admin) {
          foundAdminRole = role;
        }
      } catch (error) {
        this.logger.error(`Failed to seed role "${roleName}":`, error);
      }
    }
    this.logger.log('Roles seeding complete.');
    return { adminRole: foundAdminRole, otherRoles: createdRoles };
  }

  private async seedAdminUser(): Promise<void> {
    this.logger.log('Seeding admin user...');

    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@example.com',
    );
    const adminPassword = this.configService.get<string>(
      'ADMIN_PASSWORD',
      'changeme123',
    );
    const adminName = 'Administrator';

    if (adminPassword === 'changeme123') {
      this.logger.warn(
        'Using default admin password. Please change ADMIN_PASSWORD in your .env file!',
      );
    }

    try {
      const adminRole = await this.rolesService.findByName(RoleEnum.Admin);
      if (!adminRole) {
        this.logger.error('Admin role not found. Cannot seed admin user.');
        return;
      }

      // Kiểm tra admin user đã tồn tại chưa
      const existingAdminUser = await this.usersService.findByEmail(adminEmail); // Sử dụng biến khác

      if (!existingAdminUser) {
        // Chỉ tạo nếu user chưa tồn tại
        this.logger.log(`Admin user "${adminEmail}" not found. Creating...`);
        // Gọi hàm create, không cần gán lại kết quả vào biến adminUser nếu không dùng ngay
        await this.usersService.create({
          // Chỉ cần await để đợi tạo xong
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          roleId: adminRole.id,
          isActive: true,
        });
        this.logger.log(`Admin user "${adminEmail}" created successfully.`);
      } else {
        this.logger.log(`Admin user "${adminEmail}" already exists.`);
        // Nếu bạn cần thực hiện logic cập nhật password ở đây,
        // bạn cần gọi findByEmail một lần nữa với tùy chọn selectPassword=true
        // và sau đó mới so sánh/cập nhật.
        // Ví dụ:
        // const userWithHash = await this.usersService.findByEmail(adminEmail, true);
        // if (userWithHash && userWithHash.passwordHash) {
        //     const isPasswordMatch = await bcrypt.compare(adminPassword, userWithHash.passwordHash);
        //     if (!isPasswordMatch) {
        //         this.logger.warn(`Admin password in .env differs from database. Consider updating.`);
        //         // Thêm logic cập nhật password nếu muốn
        //     }
        // }
      }
    } catch (error) {
      this.logger.error(`Failed to seed admin user "${adminEmail}":`, error);
    }
    this.logger.log('Admin user seeding complete.');
  }
}
