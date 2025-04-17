import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string; // e.g., 'Color', 'Size'
}
