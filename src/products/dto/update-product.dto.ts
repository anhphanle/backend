import {
  IsString,
  IsOptional,
  MaxLength,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ProductStatus } from '../entities/product.entity';
// Chỉ lấy các trường của Product gốc từ CreateProductDto
import { CreateProductDto } from './create-product.dto';

// Cách 1: Dùng PartialType và Omit (phức tạp hơn)
// export class UpdateProductDto extends PartialType(OmitType(CreateProductDto, ['variants'] as const)) {}

// Cách 2: Định nghĩa lại các trường cần update (đơn giản hơn)
export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
