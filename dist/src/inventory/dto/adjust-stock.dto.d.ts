import { InventoryLogReason } from '../entities/inventory-log.entity';
export declare class AdjustStockDto {
    productVariantId: string;
    changeQuantity: number;
    reason: InventoryLogReason;
    notes?: string;
}
