// import { PartialType } from '@nestjs/mapped-types'; // Không dùng PartialType trực tiếp nữa
import { OmitType } from '@nestjs/mapped-types'; // Import OmitType thay thế
import { CreateCategoryDto } from './create-category.dto';
import { IsOptional, ValidateIf, IsUUID } from 'class-validator';

// 1. Tạo một lớp cơ sở bằng cách loại bỏ 'parentId' khỏi CreateCategoryDto
//    OmitType sẽ tự động làm các trường còn lại thành optional giống PartialType
class UpdateCategoryDtoBase extends OmitType(CreateCategoryDto, [
  'parentId',
] as const) {}

// 2. Tạo UpdateCategoryDto kế thừa từ lớp cơ sở đó
//    Và định nghĩa lại parentId với kiểu và validation mong muốn
export class UpdateCategoryDto extends UpdateCategoryDtoBase {
  @IsOptional() // Cho phép không gửi lên (không thay đổi)
  @IsUUID('4', { message: 'parentId must be a valid UUID' }) // Validate nếu là string
  @ValidateIf((_object, value) => value !== null && value !== undefined) // Chỉ validate UUID nếu giá trị là string (khác null/undefined)
  parentId?: string | null; // Cho phép là string (UUID), null (unset parent), hoặc undefined (không thay đổi)
}
