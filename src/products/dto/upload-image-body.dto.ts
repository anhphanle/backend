import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer'; // Để chuyển đổi giá trị

export class UploadImageBodyDto {
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  // Sử dụng @Transform để xử lý các giá trị 'true', '1', true thành boolean
  @IsOptional()
  @IsBoolean()
  @Transform(
    ({ value }) =>
      value === 'true' || value === true || value === '1' || value === 1,
  )
  isThumbnail?: boolean;
}
