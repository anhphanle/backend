import {
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  NotEquals,
} from 'class-validator';
import { InventoryLogReason } from '../entities/inventory-log.entity'; // Import Enum

export class AdjustStockDto {
  @IsUUID()
  @IsNotEmpty()
  productVariantId: string;

  @IsInt()
  @IsNotEmpty()
  @NotEquals(0, { message: 'Change quantity cannot be zero' }) // Không cho phép thay đổi bằng 0
  changeQuantity: number; // Số dương là nhập, số âm là xuất

  @IsEnum(InventoryLogReason)
  @IsNotEmpty()
  reason: InventoryLogReason; // Lý do từ Enum

  @IsString()
  @IsOptional()
  notes?: string;
}
