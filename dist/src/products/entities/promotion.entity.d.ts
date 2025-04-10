import { ProductVariant } from './product-variant.entity';
export declare class Promotion {
    id: string;
    productVariantId: string;
    promotionalPrice: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    productVariant: ProductVariant;
}
