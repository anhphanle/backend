import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Cần ConfigModule để đọc .env
import { RolesModule } from '../../roles/roles.module'; // Cần RolesModule để dùng RolesService
import { UsersModule } from '../../users/users.module'; // Cần UsersModule để dùng UsersService
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule, // Import ConfigModule
    RolesModule, // Import RolesModule
    UsersModule, // Import UsersModule
  ],
  providers: [SeedService, Logger], // Cung cấp SeedService và Logger
  exports: [SeedService], // Export nếu cần dùng ở nơi khác (thường không cần)
})
export class SeedModule {}
