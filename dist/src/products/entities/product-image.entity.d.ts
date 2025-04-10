import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
export declare class ProductImage {
    id: string;
    productId: string;
    variantId?: string;
    imageUrl: string;
    altText?: string;
    isThumbnail: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    product: Product;
    variant?: ProductVariant;
}
