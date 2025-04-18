import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsUUID,
  IsPositive,
  IsInt,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Kế thừa từ CreateVariantDto nhưng bỏ quantity vì nó nên được quản lý bởi Inventory Module
export class UpdateVariantDto {
  @IsString()
  @IsOptional() // Cho phép không cập nhật
  @MaxLength(100)
  sku?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayMinSize(0)
  @IsOptional()
  attributeValueIds?: string[]; // Cho phép cập nhật các thuộc tính
}
