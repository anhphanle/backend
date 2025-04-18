import { ProductsService, PaginatedProductsResult } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UploadImageBodyDto } from './dto/upload-image-body.dto';
import { ProductImage } from './entities/product-image.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(queryDto: ProductListQueryDto): Promise<PaginatedProductsResult>;
    findOne(id: string): Promise<Product>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    updateVariant(variantId: string, updateVariantDto: UpdateVariantDto): Promise<ProductVariant>;
    removeProduct(id: string): Promise<void>;
    removeVariant(variantId: string): Promise<void>;
    addImage(productId: string, file: Express.Multer.File, imageBody: UploadImageBodyDto): Promise<ProductImage>;
    addMultipleImages(productId: string, files: Array<Express.Multer.File>, imageBody: UploadImageBodyDto): Promise<ProductImage[]>;
    setThumbnail(productId: string, imageId: string): Promise<void>;
    removeImage(productId: string, imageId: string): Promise<void>;
}
