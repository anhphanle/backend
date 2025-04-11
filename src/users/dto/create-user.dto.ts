import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Role } from '../../roles/entities/role.entity'; // Import Role entity nếu cần dùng type Role

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) // Khuyến nghị mật khẩu đủ mạnh
  password: string; // Mật khẩu gốc, sẽ được hash trong service

  @IsUUID()
  @IsNotEmpty()
  roleId: string; // ID của Role cần gán

  @IsBoolean()
  @IsOptional() // Mặc định sẽ là true trong entity
  isActive?: boolean;
}
