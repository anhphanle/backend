import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';

@Controller('attributes')
@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ tất cả các route
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  // --- Attribute Routes ---

  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  createAttribute(
    @Body() createAttributeDto: CreateAttributeDto,
  ): Promise<Attribute> {
    return this.attributesService.createAttribute(createAttributeDto);
  }

  @Get()
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findAllAttributes(
    @Query('loadValues', new DefaultValuePipe(false), ParseBoolPipe)
    loadValues?: boolean,
  ): Promise<Attribute[]> {
    return this.attributesService.findAllAttributes(loadValues);
  }

  @Get(':id')
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findAttributeById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('loadValues', new DefaultValuePipe(false), ParseBoolPipe)
    loadValues?: boolean,
  ): Promise<Attribute> {
    return this.attributesService.findAttributeById(id, loadValues);
  }

  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  updateAttribute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<Attribute> {
    return this.attributesService.updateAttribute(id, updateAttributeDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAttribute(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.attributesService.removeAttribute(id);
  }

  // --- Attribute Value Routes ---

  @Post(':attributeId/values') // Tạo giá trị cho một attribute cụ thể
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  createAttributeValue(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
    @Body() createValueDto: CreateAttributeValueDto,
  ): Promise<AttributeValue> {
    return this.attributesService.createAttributeValue(
      attributeId,
      createValueDto,
    );
  }

  @Get(':attributeId/values') // Lấy tất cả giá trị của một attribute
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findValuesByAttribute(
    @Param('attributeId', ParseUUIDPipe) attributeId: string,
  ): Promise<AttributeValue[]> {
    return this.attributesService.findValuesByAttribute(attributeId);
  }

  // Có thể cần một route để lấy chi tiết một value cụ thể bằng ID của nó
  @Get('values/:valueId')
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findValueById(
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ): Promise<AttributeValue> {
    return this.attributesService.findValueById(valueId);
  }

  @Patch('values/:valueId') // Update một value cụ thể bằng ID của nó
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  updateAttributeValue(
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() updateValueDto: UpdateAttributeValueDto,
  ): Promise<AttributeValue> {
    return this.attributesService.updateAttributeValue(valueId, updateValueDto);
  }

  @Delete('values/:valueId') // Xóa một value cụ thể bằng ID của nó
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAttributeValue(
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ): Promise<void> {
    return this.attributesService.removeAttributeValue(valueId);
  }
}
