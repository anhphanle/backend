import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID() // Đảm bảo parentId là một UUID hợp lệ nếu được cung cấp
  @IsOptional()
  parentId?: string; // ID của danh mục cha (nếu có)
}
