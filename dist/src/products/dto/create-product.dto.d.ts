import { ProductStatus } from '../entities/product.entity';
import { CreateVariantDto } from './create-variant.dto';
export declare class CreateProductDto {
    name: string;
    description?: string;
    brand?: string;
    categoryId: string;
    status?: ProductStatus;
    variants: CreateVariantDto[];
}
