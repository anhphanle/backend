import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Cần ConfigModule để đọc .env
import { CloudStorageService } from './cloud-storage.service';

@Global() // Đặt Global để service này có thể được inject ở bất kỳ đâu mà không cần import Module
@Module({
  imports: [ConfigModule], // Import ConfigModule
  providers: [CloudStorageService],
  exports: [CloudStorageService], // Export service để các module khác sử dụng
})
export class CloudStorageModule {}
