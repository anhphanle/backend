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
exports.InventoryHistoryQueryDto = exports.InventoryHistorySortBy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var InventoryHistorySortBy;
(function (InventoryHistorySortBy) {
    InventoryHistorySortBy["CREATED_AT_ASC"] = "createdAt_asc";
    InventoryHistorySortBy["CREATED_AT_DESC"] = "createdAt_desc";
})(InventoryHistorySortBy || (exports.InventoryHistorySortBy = InventoryHistorySortBy = {}));
class InventoryHistoryQueryDto {
    page = 1;
    limit = 20;
    sortBy = InventoryHistorySortBy.CREATED_AT_DESC;
}
exports.InventoryHistoryQueryDto = InventoryHistoryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InventoryHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], InventoryHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(InventoryHistorySortBy),
    __metadata("design:type", String)
], InventoryHistoryQueryDto.prototype, "sortBy", void 0);
//# sourceMappingURL=inventory-history-query.dto.js.map