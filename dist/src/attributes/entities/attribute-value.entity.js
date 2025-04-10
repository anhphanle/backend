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
exports.AttributeValue = void 0;
const product_variant_entity_1 = require("../../products/entities/product-variant.entity");
const typeorm_1 = require("typeorm");
const attribute_entity_1 = require("./attribute.entity");
let AttributeValue = class AttributeValue {
    id;
    attributeId;
    value;
    createdAt;
    updatedAt;
    attribute;
    variants;
};
exports.AttributeValue = AttributeValue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AttributeValue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'attribute_id', type: 'uuid', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], AttributeValue.prototype, "attributeId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], AttributeValue.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], AttributeValue.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], AttributeValue.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attribute_entity_1.Attribute, (attribute) => attribute.values, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'attribute_id' }),
    __metadata("design:type", attribute_entity_1.Attribute)
], AttributeValue.prototype, "attribute", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_variant_entity_1.ProductVariant, (variant) => variant.attributeValues),
    __metadata("design:type", Array)
], AttributeValue.prototype, "variants", void 0);
exports.AttributeValue = AttributeValue = __decorate([
    (0, typeorm_1.Entity)('attribute_values'),
    (0, typeorm_1.Unique)(['attributeId', 'value'])
], AttributeValue);
//# sourceMappingURL=attribute-value.entity.js.map