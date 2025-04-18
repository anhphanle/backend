import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';
export interface PaginatedProductsResult {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ProductsService {
    private readonly productRepository;
    private readonly variantRepository;
    private readonly imageRepository;
    private readonly categoryRepository;
    private readonly attributeValueRepository;
    private readonly dataSource;
    private readonly cloudStorageService;
    private readonly logger;
    constructor(productRepository: Repository<Product>, variantRepository: Repository<ProductVariant>, imageRepository: Repository<ProductImage>, categoryRepository: Repository<Category>, attributeValueRepository: Repository<AttributeValue>, dataSource: DataSource, cloudStorageService: CloudStorageService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(queryDto: ProductListQueryDto): Promise<PaginatedProductsResult>;
    findOne(id: string): Promise<Product>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    updateVariant(variantId: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant>;
    removeProduct(id: string): Promise<void>;
    removeVariant(variantId: string): Promise<void>;
    addImage(productId: string, file: Express.Multer.File, variantId?: string, isThumbnail?: boolean, altText?: string): Promise<ProductImage>;
    setThumbnail(productId: string, imageId: string): Promise<void>;
    removeImage(productId: string, imageId: string): Promise<void>;
}
