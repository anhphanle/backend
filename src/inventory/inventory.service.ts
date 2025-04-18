import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import {
  InventoryLog,
  InventoryLogReason,
} from './entities/inventory-log.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity'; // Cần để validate user
import { AdjustStockDto } from './dto/adjust-stock.dto';
import {
  InventoryHistoryQueryDto,
  InventoryHistorySortBy,
} from './dto/inventory-history-query.dto';

// Interface cho kết quả phân trang log
export interface PaginatedInventoryLogsResult {
  data: InventoryLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(InventoryLog)
    private readonly inventoryLogRepository: Repository<InventoryLog>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(User) // Inject User Repo để kiểm tra User tồn tại
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource, // Inject DataSource cho transactions
  ) {}

  async adjustStock(
    adjustDto: AdjustStockDto,
    userId: string,
  ): Promise<InventoryLog> {
    const { productVariantId, changeQuantity, reason, notes } = adjustDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE'); // Mức cô lập cao để tránh race condition

    try {
      // 1. Kiểm tra User tồn tại và active
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId, isActive: true },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID "${userId}" not found or inactive.`,
        );
      }

      // 2. Lấy thông tin Variant và Khóa để cập nhật (Pessimistic Locking)
      const variant = await queryRunner.manager.findOne(ProductVariant, {
        where: { id: productVariantId, deletedAt: IsNull() },
        lock: { mode: 'pessimistic_write' }, // Khóa dòng này lại để tránh cập nhật đồng thời
      });

      if (!variant) {
        throw new NotFoundException(
          `Product Variant with ID "${productVariantId}" not found or deleted.`,
        );
      }

      // 3. Tính toán số lượng mới và kiểm tra hợp lệ
      const currentQuantity = variant.quantity;
      const newQuantity = currentQuantity + changeQuantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Cannot adjust stock. Resulting quantity (${newQuantity}) would be negative.`,
        );
      }

      // 4. Cập nhật số lượng tồn kho của Variant
      // Do đã dùng lock, có thể dùng save hoặc update
      // variant.quantity = newQuantity;
      // await queryRunner.manager.save(ProductVariant, variant);
      // Hoặc dùng update cho ngắn gọn:
      await queryRunner.manager.update(ProductVariant, productVariantId, {
        quantity: newQuantity,
      });

      // 5. Tạo và lưu Inventory Log
      const inventoryLog = queryRunner.manager.create(InventoryLog, {
        productVariantId: productVariantId,
        userId: userId,
        changeQuantity: changeQuantity,
        newQuantity: newQuantity, // Lưu số lượng *sau* khi thay đổi
        reason: reason,
        notes: notes,
      });
      const savedLog = await queryRunner.manager.save(
        InventoryLog,
        inventoryLog,
      );

      // 6. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(
        `Stock adjusted for Variant ${productVariantId} by User ${userId}. Change: ${changeQuantity}, New Qty: ${newQuantity}, Reason: ${reason}. Log ID: ${savedLog.id}`,
      );
      return savedLog;
    } catch (error) {
      // 7. Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to adjust stock for Variant ${productVariantId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to adjust stock due to an internal error.',
      );
    } finally {
      // 8. Release query runner
      await queryRunner.release();
    }
  }

  async getHistory(
    variantId: string,
    queryDto: InventoryHistoryQueryDto,
  ): Promise<PaginatedInventoryLogsResult> {
    const {
      page = 1,
      limit = 20,
      sortBy = InventoryHistorySortBy.CREATED_AT_DESC,
    } = queryDto;

    // 1. Kiểm tra Variant tồn tại (không cần lock ở đây)
    const variantExists = await this.variantRepository.exists({
      where: { id: variantId },
    });
    if (!variantExists) {
      throw new NotFoundException(
        `Product Variant with ID "${variantId}" not found.`,
      );
    }

    // 2. Tạo query builder để lấy log và phân trang
    const queryBuilder = this.inventoryLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user') // Join để lấy thông tin user (chọn lọc field nếu cần)
      .where('log.productVariantId = :variantId', { variantId });

    // Apply Sorting
    if (sortBy === InventoryHistorySortBy.CREATED_AT_ASC) {
      queryBuilder.orderBy('log.createdAt', 'ASC');
    } else {
      queryBuilder.orderBy('log.createdAt', 'DESC');
    }

    // Apply Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [logs, total] = await queryBuilder.getManyAndCount();

    // Chọn lọc thông tin user trả về nếu cần (tránh lộ thông tin nhạy cảm)
    const formattedLogs = logs.map((log) => ({
      ...log,
      user: log.user
        ? { id: log.user.id, name: log.user.name, email: log.user.email }
        : null, // Chỉ lấy id, name, email
    }));

    return {
      data: formattedLogs as any, // Cast nếu cần sau khi format user
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
