import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity'; // Import Enum Status
import { CreateVariantDto } from './create-variant.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT; // Mặc định là Draft

  @IsArray()
  @ArrayMinSize(1) // Phải có ít nhất một biến thể (kể cả sản phẩm đơn giản)
  @ValidateNested({ each: true }) // Validate từng object trong mảng
  @Type(() => CreateVariantDto) // Chỉ định kiểu cho class-transformer
  variants: CreateVariantDto[];

  // Thêm các trường khác nếu cần, ví dụ: ảnh chính ban đầu?
  // @IsOptional()
  // @IsString()
  // @IsUrl() // Hoặc validate khác tùy cách xử lý ảnh
  // mainImageUrl?: string;
}
