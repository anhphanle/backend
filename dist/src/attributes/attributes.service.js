"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AttributesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attribute_entity_1 = require("./entities/attribute.entity");
const attribute_value_entity_1 = require("./entities/attribute-value.entity");
let AttributesService = AttributesService_1 = class AttributesService {
    attributeRepository;
    attributeValueRepository;
    logger = new common_1.Logger(AttributesService_1.name);
    constructor(attributeRepository, attributeValueRepository) {
        this.attributeRepository = attributeRepository;
        this.attributeValueRepository = attributeValueRepository;
    }
    async createAttribute(createAttributeDto) {
        const { name } = createAttributeDto;
        const existingAttribute = await this.attributeRepository.findOne({
            where: { name },
        });
        if (existingAttribute) {
            throw new common_1.ConflictException(`Attribute with name "${name}" already exists.`);
        }
        const newAttribute = this.attributeRepository.create(createAttributeDto);
        try {
            const savedAttribute = await this.attributeRepository.save(newAttribute);
            this.logger.log(`Attribute created: ${savedAttribute.name} (ID: ${savedAttribute.id})`);
            return savedAttribute;
        }
        catch (error) {
            this.logger.error(`Failed to create attribute: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Could not create attribute.');
        }
    }
    async findAllAttributes(loadValues = false) {
        const options = loadValues ? { relations: ['values'] } : {};
        return this.attributeRepository.find(options);
    }
    async findAttributeById(id, loadValues = false) {
        if (!id)
            throw new common_1.BadRequestException('Attribute ID cannot be empty');
        const options = loadValues
            ? { relations: ['values'], where: { id } }
            : { where: { id } };
        const attribute = await this.attributeRepository.findOne(options);
        if (!attribute) {
            this.logger.warn(`Attribute with ID "${id}" not found.`);
            throw new common_1.NotFoundException(`Attribute with ID "${id}" not found.`);
        }
        return attribute;
    }
    async updateAttribute(id, updateAttributeDto) {
        const attribute = await this.findAttributeById(id);
        if (updateAttributeDto.name && updateAttributeDto.name !== attribute.name) {
            const existing = await this.attributeRepository.findOne({
                where: { name: updateAttributeDto.name },
            });
            if (existing) {
                throw new common_1.ConflictException(`Attribute name "${updateAttributeDto.name}" already exists.`);
            }
        }
        this.attributeRepository.merge(attribute, updateAttributeDto);
        try {
            const updatedAttribute = await this.attributeRepository.save(attribute);
            this.logger.log(`Attribute updated: ${updatedAttribute.name} (ID: ${id})`);
            return updatedAttribute;
        }
        catch (error) {
            this.logger.error(`Failed to update attribute ${id}: ${error.message}`, error.stack);
            if (error.code === '23505') {
                throw new common_1.ConflictException(`Attribute name "${updateAttributeDto.name}" already exists.`);
            }
            throw new common_1.InternalServerErrorException('Could not update attribute.');
        }
    }
    async removeAttribute(id) {
        const attribute = await this.findAttributeById(id);
        const result = await this.attributeRepository.delete(id);
        this.logger.log(`Attribute deleted: ID ${id}`);
    }
    async createAttributeValue(attributeId, createValueDto) {
        const parentAttribute = await this.findAttributeById(attributeId);
        const { value } = createValueDto;
        const existingValue = await this.attributeValueRepository.findOne({
            where: { attributeId: parentAttribute.id, value: value },
        });
        if (existingValue) {
            throw new common_1.ConflictException(`Value "${value}" already exists for attribute "${parentAttribute.name}".`);
        }
        const newValue = this.attributeValueRepository.create({
            ...createValueDto,
            attributeId: parentAttribute.id,
        });
        try {
            const savedValue = await this.attributeValueRepository.save(newValue);
            this.logger.log(`Attribute value created: ${savedValue.value} for attribute ID ${attributeId}`);
            return savedValue;
        }
        catch (error) {
            this.logger.error(`Failed to create attribute value for attribute ${attributeId}: ${error.message}`, error.stack);
            if (error.code === '23505') {
                throw new common_1.ConflictException(`Value "${value}" already exists for attribute "${parentAttribute.name}".`);
            }
            throw new common_1.InternalServerErrorException('Could not create attribute value.');
        }
    }
    async findValuesByAttribute(attributeId) {
        await this.findAttributeById(attributeId);
        return this.attributeValueRepository.find({
            where: { attributeId },
            order: { value: 'ASC' },
        });
    }
    async findValueById(valueId) {
        if (!valueId)
            throw new common_1.BadRequestException('Attribute Value ID cannot be empty');
        const value = await this.attributeValueRepository.findOne({
            where: { id: valueId },
        });
        if (!value) {
            this.logger.warn(`Attribute value with ID "${valueId}" not found.`);
            throw new common_1.NotFoundException(`Attribute value with ID "${valueId}" not found.`);
        }
        return value;
    }
    async updateAttributeValue(valueId, updateValueDto) {
        const valueToUpdate = await this.findValueById(valueId);
        const { value: newValue } = updateValueDto;
        if (newValue && newValue !== valueToUpdate.value) {
            const existing = await this.attributeValueRepository.findOne({
                where: { attributeId: valueToUpdate.attributeId, value: newValue },
            });
            if (existing) {
                const parentAttribute = await this.findAttributeById(valueToUpdate.attributeId);
                throw new common_1.ConflictException(`Value "${newValue}" already exists for attribute "${parentAttribute.name}".`);
            }
        }
        this.attributeValueRepository.merge(valueToUpdate, updateValueDto);
        try {
            const updatedValue = await this.attributeValueRepository.save(valueToUpdate);
            this.logger.log(`Attribute value updated: ${updatedValue.value} (ID: ${valueId})`);
            return updatedValue;
        }
        catch (error) {
            this.logger.error(`Failed to update attribute value ${valueId}: ${error.message}`, error.stack);
            if (error.code === '23505') {
                const parentAttribute = await this.findAttributeById(valueToUpdate.attributeId);
                throw new common_1.ConflictException(`Value "${newValue}" already exists for attribute "${parentAttribute.name}".`);
            }
            throw new common_1.InternalServerErrorException('Could not update attribute value.');
        }
    }
    async removeAttributeValue(valueId) {
        await this.findValueById(valueId);
        const result = await this.attributeValueRepository.delete(valueId);
        this.logger.log(`Attribute value deleted: ID ${valueId}`);
    }
};
exports.AttributesService = AttributesService;
exports.AttributesService = AttributesService = AttributesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attribute_entity_1.Attribute)),
    __param(1, (0, typeorm_1.InjectRepository)(attribute_value_entity_1.AttributeValue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AttributesService);
//# sourceMappingURL=attributes.service.js.map