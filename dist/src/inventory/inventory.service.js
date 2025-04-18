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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_log_entity_1 = require("./entities/inventory-log.entity");
const product_variant_entity_1 = require("../products/entities/product-variant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const inventory_history_query_dto_1 = require("./dto/inventory-history-query.dto");
let InventoryService = InventoryService_1 = class InventoryService {
    inventoryLogRepository;
    variantRepository;
    userRepository;
    dataSource;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(inventoryLogRepository, variantRepository, userRepository, dataSource) {
        this.inventoryLogRepository = inventoryLogRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }
    async adjustStock(adjustDto, userId) {
        const { productVariantId, changeQuantity, reason, notes } = adjustDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction('SERIALIZABLE');
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { id: userId, isActive: true },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID "${userId}" not found or inactive.`);
            }
            const variant = await queryRunner.manager.findOne(product_variant_entity_1.ProductVariant, {
                where: { id: productVariantId, deletedAt: (0, typeorm_2.IsNull)() },
                lock: { mode: 'pessimistic_write' },
            });
            if (!variant) {
                throw new common_1.NotFoundException(`Product Variant with ID "${productVariantId}" not found or deleted.`);
            }
            const currentQuantity = variant.quantity;
            const newQuantity = currentQuantity + changeQuantity;
            if (newQuantity < 0) {
                throw new common_1.BadRequestException(`Cannot adjust stock. Resulting quantity (${newQuantity}) would be negative.`);
            }
            await queryRunner.manager.update(product_variant_entity_1.ProductVariant, productVariantId, {
                quantity: newQuantity,
            });
            const inventoryLog = queryRunner.manager.create(inventory_log_entity_1.InventoryLog, {
                productVariantId: productVariantId,
                userId: userId,
                changeQuantity: changeQuantity,
                newQuantity: newQuantity,
                reason: reason,
                notes: notes,
            });
            const savedLog = await queryRunner.manager.save(inventory_log_entity_1.InventoryLog, inventoryLog);
            await queryRunner.commitTransaction();
            this.logger.log(`Stock adjusted for Variant ${productVariantId} by User ${userId}. Change: ${changeQuantity}, New Qty: ${newQuantity}, Reason: ${reason}. Log ID: ${savedLog.id}`);
            return savedLog;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to adjust stock for Variant ${productVariantId}: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to adjust stock due to an internal error.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getHistory(variantId, queryDto) {
        const { page = 1, limit = 20, sortBy = inventory_history_query_dto_1.InventoryHistorySortBy.CREATED_AT_DESC, } = queryDto;
        const variantExists = await this.variantRepository.exists({
            where: { id: variantId },
        });
        if (!variantExists) {
            throw new common_1.NotFoundException(`Product Variant with ID "${variantId}" not found.`);
        }
        const queryBuilder = this.inventoryLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .where('log.productVariantId = :variantId', { variantId });
        if (sortBy === inventory_history_query_dto_1.InventoryHistorySortBy.CREATED_AT_ASC) {
            queryBuilder.orderBy('log.createdAt', 'ASC');
        }
        else {
            queryBuilder.orderBy('log.createdAt', 'DESC');
        }
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [logs, total] = await queryBuilder.getManyAndCount();
        const formattedLogs = logs.map((log) => ({
            ...log,
            user: log.user
                ? { id: log.user.id, name: log.user.name, email: log.user.email }
                : null,
        }));
        return {
            data: formattedLogs,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_log_entity_1.InventoryLog)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map