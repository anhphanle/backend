import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
export declare class AttributesController {
    private readonly attributesService;
    constructor(attributesService: AttributesService);
    createAttribute(createAttributeDto: CreateAttributeDto): Promise<Attribute>;
    findAllAttributes(loadValues?: boolean): Promise<Attribute[]>;
    findAttributeById(id: string, loadValues?: boolean): Promise<Attribute>;
    updateAttribute(id: string, updateAttributeDto: UpdateAttributeDto): Promise<Attribute>;
    removeAttribute(id: string): Promise<void>;
    createAttributeValue(attributeId: string, createValueDto: CreateAttributeValueDto): Promise<AttributeValue>;
    findValuesByAttribute(attributeId: string): Promise<AttributeValue[]>;
    findValueById(valueId: string): Promise<AttributeValue>;
    updateAttributeValue(valueId: string, updateValueDto: UpdateAttributeValueDto): Promise<AttributeValue>;
    removeAttributeValue(valueId: string): Promise<void>;
}
