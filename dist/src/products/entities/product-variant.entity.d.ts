import { AttributeValue } from '../../attributes/entities/attribute-value.entity';
import { InventoryLog } from '../../inventory/entities/inventory-log.entity';
import { Promotion } from './promotion.entity';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
export declare class ProductVariant {
    id: string;
    productId: string;
    sku: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    product: Product;
    attributeValues: AttributeValue[];
    images: ProductImage[];
    inventoryLogs: InventoryLog[];
    promotions: Promotion[];
}
