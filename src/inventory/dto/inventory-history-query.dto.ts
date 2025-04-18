import { IsOptional, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryHistorySortBy {
  CREATED_AT_ASC = 'createdAt_asc',
  CREATED_AT_DESC = 'createdAt_desc',
}

export class InventoryHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20; // Giới hạn số lượng log mỗi trang

  @IsOptional()
  @IsEnum(InventoryHistorySortBy)
  sortBy?: InventoryHistorySortBy = InventoryHistorySortBy.CREATED_AT_DESC; // Mặc định log mới nhất

  // Thêm filter nếu cần (vd: theo reason, theo user?)
  // @IsOptional()
  // @IsUUID()
  // userId?: string;

  // @IsOptional()
  // @IsEnum(InventoryLogReason)
  // reason?: InventoryLogReason;
}
