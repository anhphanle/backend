import { User } from '../../users/entities/user.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';
export declare enum InventoryLogReason {
    MANUAL_STOCK_IN = "Manual Stock In",
    MANUAL_STOCK_OUT = "Manual Stock Out",
    INITIAL_STOCK = "Initial Stock",
    SALE_ADJUSTMENT = "Sale Adjustment",
    RETURN_STOCK = "Return Stock",
    INVENTORY_COUNT_ADJUSTMENT = "Inventory Count Adjustment",
    TRANSFER_IN = "Transfer In",
    TRANSFER_OUT = "Transfer Out",
    DAMAGE_LOSS = "Damage/Loss"
}
export declare class InventoryLog {
    id: number;
    userId?: string;
    productVariantId: string;
    changeQuantity: number;
    newQuantity: number;
    reason: InventoryLogReason;
    notes?: string;
    createdAt: Date;
    user?: User;
    productVariant: ProductVariant;
}
