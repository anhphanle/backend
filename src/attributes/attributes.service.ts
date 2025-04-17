import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';

@Injectable()
export class AttributesService {
  private readonly logger = new Logger(AttributesService.name);

  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  // --- Attribute Methods ---

  async createAttribute(
    createAttributeDto: CreateAttributeDto,
  ): Promise<Attribute> {
    const { name } = createAttributeDto;
    const existingAttribute = await this.attributeRepository.findOne({
      where: { name },
    });
    if (existingAttribute) {
      throw new ConflictException(
        `Attribute with name "${name}" already exists.`,
      );
    }

    const newAttribute = this.attributeRepository.create(createAttributeDto);
    try {
      const savedAttribute = await this.attributeRepository.save(newAttribute);
      this.logger.log(
        `Attribute created: ${savedAttribute.name} (ID: ${savedAttribute.id})`,
      );
      return savedAttribute;
    } catch (error) {
      this.logger.error(
        `Failed to create attribute: ${error.message}`,
        error.stack,
      );
      // Bắt các lỗi khác nếu cần, ví dụ lỗi DB
      throw new InternalServerErrorException('Could not create attribute.');
    }
  }

  async findAllAttributes(loadValues: boolean = false): Promise<Attribute[]> {
    const options = loadValues ? { relations: ['values'] } : {};
    return this.attributeRepository.find(options);
  }

  async findAttributeById(
    id: string,
    loadValues: boolean = false,
  ): Promise<Attribute> {
    if (!id) throw new BadRequestException('Attribute ID cannot be empty');
    const options = loadValues
      ? { relations: ['values'], where: { id } }
      : { where: { id } };
    const attribute = await this.attributeRepository.findOne(options);
    if (!attribute) {
      this.logger.warn(`Attribute with ID "${id}" not found.`);
      throw new NotFoundException(`Attribute with ID "${id}" not found.`);
    }
    return attribute;
  }

  async updateAttribute(
    id: string,
    updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    const attribute = await this.findAttributeById(id); // Check if exists first

    // Kiểm tra nếu tên mới đã tồn tại ở attribute khác
    if (updateAttributeDto.name && updateAttributeDto.name !== attribute.name) {
      const existing = await this.attributeRepository.findOne({
        where: { name: updateAttributeDto.name },
      });
      if (existing) {
        throw new ConflictException(
          `Attribute name "${updateAttributeDto.name}" already exists.`,
        );
      }
    }

    // Merge và lưu
    this.attributeRepository.merge(attribute, updateAttributeDto);
    try {
      const updatedAttribute = await this.attributeRepository.save(attribute);
      this.logger.log(
        `Attribute updated: ${updatedAttribute.name} (ID: ${id})`,
      );
      return updatedAttribute;
    } catch (error) {
      this.logger.error(
        `Failed to update attribute ${id}: ${error.message}`,
        error.stack,
      );
      // Bắt lỗi unique nếu merge không kiểm tra được
      if (error.code === '23505') {
        throw new ConflictException(
          `Attribute name "${updateAttributeDto.name}" already exists.`,
        );
      }
      throw new InternalServerErrorException('Could not update attribute.');
    }
  }

  async removeAttribute(id: string): Promise<void> {
    // Tìm attribute để đảm bảo nó tồn tại trước khi xóa
    const attribute = await this.findAttributeById(id);
    // Do có ON DELETE CASCADE, việc xóa Attribute sẽ tự động xóa AttributeValue và CategoryAttribute liên quan
    const result = await this.attributeRepository.delete(id);

    // TypeORM delete không báo lỗi nếu ID không tồn tại, nên cần check findAttributeById trước
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Attribute with ID "${id}" not found.`);
    // }
    this.logger.log(`Attribute deleted: ID ${id}`);
  }

  // --- Attribute Value Methods ---

  async createAttributeValue(
    attributeId: string,
    createValueDto: CreateAttributeValueDto,
  ): Promise<AttributeValue> {
    // 1. Kiểm tra Attribute cha có tồn tại không
    const parentAttribute = await this.findAttributeById(attributeId);

    // 2. Kiểm tra giá trị đã tồn tại cho attribute này chưa
    const { value } = createValueDto;
    const existingValue = await this.attributeValueRepository.findOne({
      where: { attributeId: parentAttribute.id, value: value },
    });
    if (existingValue) {
      throw new ConflictException(
        `Value "${value}" already exists for attribute "${parentAttribute.name}".`,
      );
    }

    // 3. Tạo và lưu giá trị mới
    const newValue = this.attributeValueRepository.create({
      ...createValueDto,
      attributeId: parentAttribute.id, // Gán ID của attribute cha
      // attribute: parentAttribute // Hoặc gán object nếu muốn
    });

    try {
      const savedValue = await this.attributeValueRepository.save(newValue);
      this.logger.log(
        `Attribute value created: ${savedValue.value} for attribute ID ${attributeId}`,
      );
      return savedValue;
    } catch (error) {
      // Lỗi unique constraint đã được check ở trên, nhưng vẫn bắt lỗi DB khác
      this.logger.error(
        `Failed to create attribute value for attribute ${attributeId}: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        // Dự phòng
        throw new ConflictException(
          `Value "${value}" already exists for attribute "${parentAttribute.name}".`,
        );
      }
      throw new InternalServerErrorException(
        'Could not create attribute value.',
      );
    }
  }

  async findValuesByAttribute(attributeId: string): Promise<AttributeValue[]> {
    // Kiểm tra attribute tồn tại
    await this.findAttributeById(attributeId);
    return this.attributeValueRepository.find({
      where: { attributeId },
      order: { value: 'ASC' },
    });
  }

  async findValueById(valueId: string): Promise<AttributeValue> {
    if (!valueId)
      throw new BadRequestException('Attribute Value ID cannot be empty');
    const value = await this.attributeValueRepository.findOne({
      where: { id: valueId },
    }); // Có thể load thêm 'attribute' nếu cần
    if (!value) {
      this.logger.warn(`Attribute value with ID "${valueId}" not found.`);
      throw new NotFoundException(
        `Attribute value with ID "${valueId}" not found.`,
      );
    }
    return value;
  }

  async updateAttributeValue(
    valueId: string,
    updateValueDto: UpdateAttributeValueDto,
  ): Promise<AttributeValue> {
    const valueToUpdate = await this.findValueById(valueId); // Tìm giá trị cần update

    // Kiểm tra nếu giá trị mới đã tồn tại cho cùng attribute cha
    const { value: newValue } = updateValueDto;
    if (newValue && newValue !== valueToUpdate.value) {
      const existing = await this.attributeValueRepository.findOne({
        where: { attributeId: valueToUpdate.attributeId, value: newValue },
      });
      if (existing) {
        // Lấy tên attribute cha để báo lỗi rõ hơn
        const parentAttribute = await this.findAttributeById(
          valueToUpdate.attributeId,
        );
        throw new ConflictException(
          `Value "${newValue}" already exists for attribute "${parentAttribute.name}".`,
        );
      }
    }

    // Merge và lưu
    this.attributeValueRepository.merge(valueToUpdate, updateValueDto);
    try {
      const updatedValue =
        await this.attributeValueRepository.save(valueToUpdate);
      this.logger.log(
        `Attribute value updated: ${updatedValue.value} (ID: ${valueId})`,
      );
      return updatedValue;
    } catch (error) {
      this.logger.error(
        `Failed to update attribute value ${valueId}: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        // Dự phòng
        const parentAttribute = await this.findAttributeById(
          valueToUpdate.attributeId,
        );
        throw new ConflictException(
          `Value "${newValue}" already exists for attribute "${parentAttribute.name}".`,
        );
      }
      throw new InternalServerErrorException(
        'Could not update attribute value.',
      );
    }
  }

  async removeAttributeValue(valueId: string): Promise<void> {
    // Tìm để đảm bảo tồn tại trước khi xóa
    await this.findValueById(valueId);
    // Xóa cứng. Các liên kết trong variant_attribute_values sẽ bị ảnh hưởng (cần xử lý ở logic variant nếu cần)
    // Hoặc `ON DELETE CASCADE` trên FK của variant_attribute_values trỏ về attribute_values. Schema hiện tại có.
    const result = await this.attributeValueRepository.delete(valueId);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Attribute value with ID "${valueId}" not found.`);
    // }
    this.logger.log(`Attribute value deleted: ID ${valueId}`);
  }
}
