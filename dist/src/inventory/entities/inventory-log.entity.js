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
exports.InventoryLog = exports.InventoryLogReason = void 0;
const user_entity_1 = require("../../users/entities/user.entity");
const product_variant_entity_1 = require("../../products/entities/product-variant.entity");
const typeorm_1 = require("typeorm");
var InventoryLogReason;
(function (InventoryLogReason) {
    InventoryLogReason["MANUAL_STOCK_IN"] = "Manual Stock In";
    InventoryLogReason["MANUAL_STOCK_OUT"] = "Manual Stock Out";
    InventoryLogReason["INITIAL_STOCK"] = "Initial Stock";
    InventoryLogReason["SALE_ADJUSTMENT"] = "Sale Adjustment";
    InventoryLogReason["RETURN_STOCK"] = "Return Stock";
    InventoryLogReason["INVENTORY_COUNT_ADJUSTMENT"] = "Inventory Count Adjustment";
    InventoryLogReason["TRANSFER_IN"] = "Transfer In";
    InventoryLogReason["TRANSFER_OUT"] = "Transfer Out";
    InventoryLogReason["DAMAGE_LOSS"] = "Damage/Loss";
})(InventoryLogReason || (exports.InventoryLogReason = InventoryLogReason = {}));
let InventoryLog = class InventoryLog {
    id;
    userId;
    productVariantId;
    changeQuantity;
    newQuantity;
    reason;
    notes;
    createdAt;
    user;
    productVariant;
};
exports.InventoryLog = InventoryLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", Number)
], InventoryLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_variant_id', type: 'uuid', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryLog.prototype, "productVariantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'change_quantity', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], InventoryLog.prototype, "changeQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_quantity', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], InventoryLog.prototype, "newQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InventoryLogReason,
        nullable: false,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InventoryLog.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InventoryLog.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], InventoryLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.inventoryLogs, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], InventoryLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_variant_entity_1.ProductVariant, (variant) => variant.inventoryLogs, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'product_variant_id' }),
    __metadata("design:type", product_variant_entity_1.ProductVariant)
], InventoryLog.prototype, "productVariant", void 0);
exports.InventoryLog = InventoryLog = __decorate([
    (0, typeorm_1.Entity)('inventory_logs')
], InventoryLog);
//# sourceMappingURL=inventory-log.entity.js.map