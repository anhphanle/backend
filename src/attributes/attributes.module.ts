import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
// import { AuthModule } from '../auth/auth.module'; // Nếu cần

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeValue]), // Đăng ký cả hai entity
    // AuthModule, // Nếu cần
  ],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService], // Export nếu cần dùng ở module khác (vd: Products)
})
export class AttributesModule {}
