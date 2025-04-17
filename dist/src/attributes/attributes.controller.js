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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesController = void 0;
const common_1 = require("@nestjs/common");
const attributes_service_1 = require("./attributes.service");
const create_attribute_dto_1 = require("./dto/create-attribute.dto");
const update_attribute_dto_1 = require("./dto/update-attribute.dto");
const create_attribute_value_dto_1 = require("./dto/create-attribute-value.dto");
const update_attribute_value_dto_1 = require("./dto/update-attribute-value.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../roles/roles.enum");
let AttributesController = class AttributesController {
    attributesService;
    constructor(attributesService) {
        this.attributesService = attributesService;
    }
    createAttribute(createAttributeDto) {
        return this.attributesService.createAttribute(createAttributeDto);
    }
    findAllAttributes(loadValues) {
        return this.attributesService.findAllAttributes(loadValues);
    }
    findAttributeById(id, loadValues) {
        return this.attributesService.findAttributeById(id, loadValues);
    }
    updateAttribute(id, updateAttributeDto) {
        return this.attributesService.updateAttribute(id, updateAttributeDto);
    }
    removeAttribute(id) {
        return this.attributesService.removeAttribute(id);
    }
    createAttributeValue(attributeId, createValueDto) {
        return this.attributesService.createAttributeValue(attributeId, createValueDto);
    }
    findValuesByAttribute(attributeId) {
        return this.attributesService.findValuesByAttribute(attributeId);
    }
    findValueById(valueId) {
        return this.attributesService.findValueById(valueId);
    }
    updateAttributeValue(valueId, updateValueDto) {
        return this.attributesService.updateAttributeValue(valueId, updateValueDto);
    }
    removeAttributeValue(valueId) {
        return this.attributesService.removeAttributeValue(valueId);
    }
};
exports.AttributesController = AttributesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attribute_dto_1.CreateAttributeDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "createAttribute", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Query)('loadValues', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "findAllAttributes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('loadValues', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "findAttributeById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attribute_dto_1.UpdateAttributeDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "updateAttribute", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "removeAttribute", null);
__decorate([
    (0, common_1.Post)(':attributeId/values'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Param)('attributeId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_attribute_value_dto_1.CreateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "createAttributeValue", null);
__decorate([
    (0, common_1.Get)(':attributeId/values'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Param)('attributeId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "findValuesByAttribute", null);
__decorate([
    (0, common_1.Get)('values/:valueId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Param)('valueId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "findValueById", null);
__decorate([
    (0, common_1.Patch)('values/:valueId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Param)('valueId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attribute_value_dto_1.UpdateAttributeValueDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "updateAttributeValue", null);
__decorate([
    (0, common_1.Delete)('values/:valueId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('valueId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "removeAttributeValue", null);
exports.AttributesController = AttributesController = __decorate([
    (0, common_1.Controller)('attributes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attributes_service_1.AttributesService])
], AttributesController);
//# sourceMappingURL=attributes.controller.js.map