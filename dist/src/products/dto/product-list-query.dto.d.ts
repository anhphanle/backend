import { ProductStatus } from '../entities/product.entity';
export declare enum ProductSortBy {
    NAME_ASC = "name_asc",
    NAME_DESC = "name_desc",
    CREATED_AT_ASC = "createdAt_asc",
    CREATED_AT_DESC = "createdAt_desc"
}
export declare class ProductListQueryDto {
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
    sortBy?: ProductSortBy;
    page?: number;
    limit?: number;
}
