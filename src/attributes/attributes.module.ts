import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeValue]), // Đăng ký cả hai entities
  ],
  // controllers: [],
  // providers: [],
  // exports: [] // Có thể cần export service/repository sau này
})
export class AttributesModule {}
