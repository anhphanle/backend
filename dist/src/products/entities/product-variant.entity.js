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
exports.ProductVariant = void 0;
const attribute_value_entity_1 = require("../../attributes/entities/attribute-value.entity");
const inventory_log_entity_1 = require("../../inventory/entities/inventory-log.entity");
const promotion_entity_1 = require("./promotion.entity");
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const product_image_entity_1 = require("./product-image.entity");
let ProductVariant = class ProductVariant {
    id;
    productId;
    sku;
    price;
    quantity;
    createdAt;
    updatedAt;
    deletedAt;
    product;
    attributeValues;
    images;
    inventoryLogs;
    promotions;
};
exports.ProductVariant = ProductVariant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductVariant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', type: 'uuid', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProductVariant.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false, unique: true }),
    __metadata("design:type", String)
], ProductVariant.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: false,
        default: 0.0,
    }),
    __metadata("design:type", Number)
], ProductVariant.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false, default: 0 }),
    __metadata("design:type", Number)
], ProductVariant.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], ProductVariant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], ProductVariant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], ProductVariant.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.variants, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], ProductVariant.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attribute_value_entity_1.AttributeValue, (value) => value.variants, {
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinTable)({
        name: 'variant_attribute_values',
        joinColumn: { name: 'variant_id', referencedColumnName: 'id' },
        inverseJoinColumn: {
            name: 'attribute_value_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], ProductVariant.prototype, "attributeValues", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_image_entity_1.ProductImage, (image) => image.variant),
    __metadata("design:type", Array)
], ProductVariant.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inventory_log_entity_1.InventoryLog, (log) => log.productVariant),
    __metadata("design:type", Array)
], ProductVariant.prototype, "inventoryLogs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => promotion_entity_1.Promotion, (promo) => promo.productVariant),
    __metadata("design:type", Array)
], ProductVariant.prototype, "promotions", void 0);
exports.ProductVariant = ProductVariant = __decorate([
    (0, typeorm_1.Entity)('product_variants')
], ProductVariant);
//# sourceMappingURL=product-variant.entity.js.map