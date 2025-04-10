import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
export declare enum ProductStatus {
    DRAFT = "Draft",
    ACTIVE = "Active",
    ARCHIVED = "Archived"
}
export declare class Product {
    id: string;
    name: string;
    description: string;
    brand: string;
    categoryId: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    category: Category;
    variants: ProductVariant[];
    images: ProductImage[];
}
