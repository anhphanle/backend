import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

// Không kế thừa từ Create DTO vì không muốn attributeId có trong body
export class UpdateAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string;
}
