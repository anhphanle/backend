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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCategoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_category_dto_1 = require("./create-category.dto");
const class_validator_1 = require("class-validator");
class UpdateCategoryDtoBase extends (0, mapped_types_1.OmitType)(create_category_dto_1.CreateCategoryDto, [
    'parentId',
]) {
}
class UpdateCategoryDto extends UpdateCategoryDtoBase {
    parentId;
}
exports.UpdateCategoryDto = UpdateCategoryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'parentId must be a valid UUID' }),
    (0, class_validator_1.ValidateIf)((_object, value) => value !== null && value !== undefined),
    __metadata("design:type", Object)
], UpdateCategoryDto.prototype, "parentId", void 0);
//# sourceMappingURL=update-category.dto.js.map