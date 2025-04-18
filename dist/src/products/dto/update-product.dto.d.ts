import { ProductStatus } from '../entities/product.entity';
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    brand?: string;
    categoryId?: string;
    status?: ProductStatus;
}
