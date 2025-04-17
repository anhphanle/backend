import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  value: string; // e.g., 'Red', 'XL'

  // Không cần attributeId ở đây vì nó sẽ lấy từ URL param
  // @IsUUID()
  // @IsNotEmpty()
  // attributeId: string;
}
