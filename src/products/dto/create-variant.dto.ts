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

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string; // SKU duy nhất cho biến thể

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsInt() // Tồn kho phải là số nguyên
  @Min(0)
  @IsNotEmpty()
  quantity: number; // Số lượng tồn kho ban đầu

  @IsArray()
  @IsUUID('all', { each: true }) // Mảng các ID của AttributeValue
  @ArrayMinSize(0) // Cho phép không có attribute value nếu sản phẩm cực kỳ đơn giản
  @IsOptional() // Có thể optional nếu sản phẩm không có thuộc tính
  attributeValueIds?: string[];
}
