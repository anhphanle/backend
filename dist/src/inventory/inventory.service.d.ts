import { Repository, DataSource } from 'typeorm';
import { InventoryLog } from './entities/inventory-log.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryHistoryQueryDto } from './dto/inventory-history-query.dto';
export interface PaginatedInventoryLogsResult {
    data: InventoryLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class InventoryService {
    private readonly inventoryLogRepository;
    private readonly variantRepository;
    private readonly userRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(inventoryLogRepository: Repository<InventoryLog>, variantRepository: Repository<ProductVariant>, userRepository: Repository<User>, dataSource: DataSource);
    adjustStock(adjustDto: AdjustStockDto, userId: string): Promise<InventoryLog>;
    getHistory(variantId: string, queryDto: InventoryHistoryQueryDto): Promise<PaginatedInventoryLogsResult>;
}
