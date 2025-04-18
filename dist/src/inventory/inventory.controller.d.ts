import { InventoryService, PaginatedInventoryLogsResult } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryHistoryQueryDto } from './dto/inventory-history-query.dto';
import { User } from '../users/entities/user.entity';
import { InventoryLog } from './entities/inventory-log.entity';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    adjustStock(adjustDto: AdjustStockDto, user: User): Promise<InventoryLog>;
    getHistory(variantId: string, queryDto: InventoryHistoryQueryDto): Promise<PaginatedInventoryLogsResult>;
}
