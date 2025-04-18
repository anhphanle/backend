import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer'; // Để chuyển đổi string sang number
import { ProductStatus } from '../entities/product.entity';

export enum ProductSortBy {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  CREATED_AT_ASC = 'createdAt_asc',
  CREATED_AT_DESC = 'createdAt_desc',
  // Thêm các tiêu chí sort khác nếu cần (price, etc.)
}

export class ProductListQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Tìm theo tên hoặc SKU

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT_DESC; // Mặc định sort theo ngày tạo mới nhất

  @IsOptional()
  @Type(() => Number) // Chuyển string từ query param sang number
  @IsInt()
  @Min(1)
  page?: number = 1; // Trang hiện tại

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Giới hạn số lượng item mỗi trang
  limit?: number = 10; // Số lượng item mỗi trang
}
