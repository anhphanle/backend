"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
const product_image_entity_1 = require("./entities/product-image.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const attribute_value_entity_1 = require("../attributes/entities/attribute-value.entity");
const product_list_query_dto_1 = require("./dto/product-list-query.dto");
const cloud_storage_service_1 = require("../cloud-storage/cloud-storage.service");
let ProductsService = ProductsService_1 = class ProductsService {
    productRepository;
    variantRepository;
    imageRepository;
    categoryRepository;
    attributeValueRepository;
    dataSource;
    cloudStorageService;
    logger = new common_1.Logger(ProductsService_1.name);
    constructor(productRepository, variantRepository, imageRepository, categoryRepository, attributeValueRepository, dataSource, cloudStorageService) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
        this.categoryRepository = categoryRepository;
        this.attributeValueRepository = attributeValueRepository;
        this.dataSource = dataSource;
        this.cloudStorageService = cloudStorageService;
    }
    async create(createProductDto) {
        const { categoryId, variants, ...productData } = createProductDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const category = await queryRunner.manager.findOne(category_entity_1.Category, {
                where: { id: categoryId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!category) {
                throw new common_1.BadRequestException(`Category with ID "${categoryId}" not found or has been deleted.`);
            }
            const product = queryRunner.manager.create(product_entity_1.Product, {
                ...productData,
                categoryId: category.id,
            });
            const savedProduct = await queryRunner.manager.save(product_entity_1.Product, product);
            this.logger.log(`Product entity created: ${savedProduct.name} (ID: ${savedProduct.id})`);
            const savedVariants = [];
            for (const variantDto of variants) {
                const { attributeValueIds, ...variantData } = variantDto;
                const existingSku = await queryRunner.manager.findOne(product_variant_entity_1.ProductVariant, {
                    where: { sku: variantData.sku },
                });
                if (existingSku) {
                    throw new common_1.ConflictException(`SKU "${variantData.sku}" already exists.`);
                }
                let foundAttributeValues = [];
                if (attributeValueIds && attributeValueIds.length > 0) {
                    foundAttributeValues = await queryRunner.manager.findByIds(attribute_value_entity_1.AttributeValue, attributeValueIds);
                    if (foundAttributeValues.length !== attributeValueIds.length) {
                        const notFoundIds = attributeValueIds.filter((id) => !foundAttributeValues.some((av) => av.id === id));
                        throw new common_1.BadRequestException(`AttributeValue IDs not found: ${notFoundIds.join(', ')}`);
                    }
                }
                const variant = queryRunner.manager.create(product_variant_entity_1.ProductVariant, {
                    ...variantData,
                    productId: savedProduct.id,
                    attributeValues: foundAttributeValues,
                });
                const savedVariant = await queryRunner.manager.save(product_variant_entity_1.ProductVariant, variant);
                this.logger.log(`Variant created: SKU ${savedVariant.sku} for Product ID ${savedProduct.id}`);
                savedVariants.push(savedVariant);
                if (variantData.quantity > 0) {
                }
            }
            await queryRunner.commitTransaction();
            this.logger.log(`Product "${savedProduct.name}" and its variants created successfully.`);
            return savedProduct;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create product transaction: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create product due to an internal error.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(queryDto) {
        const { search, categoryId, status, sortBy, page = 1, limit = 10, } = queryDto;
        const queryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoin('product.variants', 'variant')
            .leftJoinAndSelect('product.images', 'thumbnailImage', 'thumbnailImage.isThumbnail = true')
            .where('product.deletedAt IS NULL');
        if (status) {
            queryBuilder.andWhere('product.status = :status', { status });
        }
        if (categoryId) {
            queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
        }
        if (search) {
            queryBuilder.andWhere(new typeorm_2.Brackets((qb) => {
                qb.where('product.name ILIKE :search', {
                    search: `%${search}%`,
                }).orWhere('variant.sku ILIKE :search', { search: `%${search}%` });
            }));
        }
        switch (sortBy) {
            case product_list_query_dto_1.ProductSortBy.NAME_ASC:
                queryBuilder.orderBy('product.name', 'ASC');
                break;
            case product_list_query_dto_1.ProductSortBy.NAME_DESC:
                queryBuilder.orderBy('product.name', 'DESC');
                break;
            case product_list_query_dto_1.ProductSortBy.CREATED_AT_ASC:
                queryBuilder.orderBy('product.createdAt', 'ASC');
                break;
            case product_list_query_dto_1.ProductSortBy.CREATED_AT_DESC:
            default:
                queryBuilder.orderBy('product.createdAt', 'DESC');
                break;
        }
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [products, total] = await queryBuilder.getManyAndCount();
        return {
            data: products,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        if (!id)
            throw new common_1.BadRequestException('Product ID cannot be empty');
        const product = await this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.variants', 'variant', 'variant.deletedAt IS NULL')
            .leftJoinAndSelect('variant.attributeValues', 'attributeValue')
            .leftJoinAndSelect('attributeValue.attribute', 'attribute')
            .leftJoinAndSelect('product.images', 'image')
            .leftJoinAndSelect('variant.images', 'variantImage')
            .where('product.id = :id', { id })
            .andWhere('product.deletedAt IS NULL')
            .orderBy({
            'variant.createdAt': 'ASC',
            'image.displayOrder': 'ASC',
            'image.createdAt': 'ASC',
            'variantImage.displayOrder': 'ASC',
            'variantImage.createdAt': 'ASC',
        })
            .getOne();
        if (!product) {
            this.logger.warn(`Product with ID "${id}" not found.`);
            throw new common_1.NotFoundException(`Product with ID "${id}" not found.`);
        }
        return product;
    }
    async updateProduct(id, updateProductDto) {
        const { categoryId, ...productData } = updateProductDto;
        const productToUpdate = await this.findOne(id);
        if (categoryId && categoryId !== productToUpdate.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: categoryId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!category) {
                throw new common_1.BadRequestException(`New category with ID "${categoryId}" not found or has been deleted.`);
            }
            productToUpdate.categoryId = categoryId;
        }
        this.productRepository.merge(productToUpdate, productData);
        try {
            const updatedProduct = await this.productRepository.save(productToUpdate);
            this.logger.log(`Product updated successfully: ${updatedProduct.name} (ID: ${id})`);
            return updatedProduct;
        }
        catch (error) {
            this.logger.error(`Failed to update product ${id}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Could not update product.');
        }
    }
    async updateVariant(variantId, updateVariantDto) {
        const { sku, attributeValueIds, ...variantData } = updateVariantDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const variantToUpdate = await queryRunner.manager.findOne(product_variant_entity_1.ProductVariant, {
                where: { id: variantId, deletedAt: (0, typeorm_2.IsNull)() },
                relations: ['attributeValues'],
            });
            if (!variantToUpdate) {
                throw new common_1.NotFoundException(`Product variant with ID "${variantId}" not found.`);
            }
            if (sku && sku !== variantToUpdate.sku) {
                const existingSku = await queryRunner.manager.findOne(product_variant_entity_1.ProductVariant, {
                    where: { sku: sku },
                });
                if (existingSku && existingSku.id !== variantId) {
                    throw new common_1.ConflictException(`SKU "${sku}" already exists for another variant.`);
                }
                variantToUpdate.sku = sku;
            }
            if (variantData.price !== undefined)
                variantToUpdate.price = variantData.price;
            if (attributeValueIds !== undefined) {
                let newAttributeValues = [];
                if (attributeValueIds.length > 0) {
                    newAttributeValues = await queryRunner.manager.findByIds(attribute_value_entity_1.AttributeValue, attributeValueIds);
                    if (newAttributeValues.length !== attributeValueIds.length) {
                        const notFoundIds = attributeValueIds.filter((id) => !newAttributeValues.some((av) => av.id === id));
                        throw new common_1.BadRequestException(`AttributeValue IDs not found: ${notFoundIds.join(', ')}`);
                    }
                }
                variantToUpdate.attributeValues = newAttributeValues;
            }
            const updatedVariant = await queryRunner.manager.save(product_variant_entity_1.ProductVariant, variantToUpdate);
            await queryRunner.commitTransaction();
            this.logger.log(`Variant updated successfully: SKU ${updatedVariant.sku} (ID: ${variantId})`);
            return updatedVariant;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to update variant transaction ${variantId}: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update variant due to an internal error.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async removeProduct(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id, deletedAt: (0, typeorm_2.IsNull)() },
                relations: ['variants'],
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID "${id}" not found.`);
            }
            const variantIds = product.variants.map((v) => v.id);
            if (variantIds.length > 0) {
                try {
                    await queryRunner.manager.softDelete(product_variant_entity_1.ProductVariant, variantIds);
                    this.logger.log(`Soft deleted variants for product ${id}: ${variantIds.join(', ')}`);
                }
                catch (error) {
                    if (error.code === '23503' &&
                        error.constraint?.includes('fk_log_variant')) {
                        this.logger.error(`Cannot delete product ${id} because one or more variants have inventory history.`);
                        throw new common_1.ConflictException('Cannot delete product. Some variants have inventory history.');
                    }
                    throw error;
                }
            }
            await queryRunner.manager.softDelete(product_entity_1.Product, id);
            await queryRunner.commitTransaction();
            this.logger.log(`Product soft deleted successfully: ID ${id}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to soft delete product transaction ${id}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Could not soft delete product.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async removeVariant(variantId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const variant = await queryRunner.manager.findOne(product_variant_entity_1.ProductVariant, {
                where: { id: variantId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!variant) {
                throw new common_1.NotFoundException(`Product variant with ID "${variantId}" not found.`);
            }
            try {
                const result = await queryRunner.manager.softDelete(product_variant_entity_1.ProductVariant, variantId);
                if (result.affected === 0) {
                    throw new common_1.NotFoundException(`Product variant with ID "${variantId}" not found during deletion.`);
                }
            }
            catch (error) {
                if (error.code === '23503' &&
                    error.constraint?.includes('fk_log_variant')) {
                    this.logger.error(`Cannot delete variant ${variantId} because it has inventory history.`);
                    throw new common_1.ConflictException('Cannot delete variant. It has inventory history.');
                }
                throw error;
            }
            await queryRunner.commitTransaction();
            this.logger.log(`Variant soft deleted successfully: ID ${variantId}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to soft delete variant transaction ${variantId}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Could not soft delete variant.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async addImage(productId, file, variantId, isThumbnail = false, altText) {
        if (!file) {
            throw new common_1.BadRequestException('No image file provided.');
        }
        const product = await this.productRepository.findOne({
            where: { id: productId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${productId}" not found.`);
        }
        let variant = null;
        if (variantId) {
            variant = await this.variantRepository.findOne({
                where: { id: variantId, productId: productId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!variant) {
                throw new common_1.NotFoundException(`Variant with ID "${variantId}" not found for product "${productId}".`);
            }
        }
        let imageUrl;
        try {
            imageUrl = await this.cloudStorageService.uploadFile(file.buffer, file.originalname, file.mimetype, `products/${productId}/`);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Failed to upload image to cloud storage.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (isThumbnail) {
                await queryRunner.manager.update(product_image_entity_1.ProductImage, { productId: productId, isThumbnail: true }, { isThumbnail: false });
                this.logger.log(`Unset previous thumbnail for product ${productId}`);
            }
            const newImage = queryRunner.manager.create(product_image_entity_1.ProductImage, {
                productId: productId,
                variantId: variantId,
                imageUrl: imageUrl,
                altText: altText,
                isThumbnail: isThumbnail,
            });
            const savedImage = await queryRunner.manager.save(product_image_entity_1.ProductImage, newImage);
            await queryRunner.commitTransaction();
            this.logger.log(`Image added successfully for product ${productId}. Image ID: ${savedImage.id}, URL: ${imageUrl}`);
            return savedImage;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to add image record for product ${productId}: ${error.message}`, error.stack);
            try {
                await this.cloudStorageService.deleteFile(imageUrl);
                this.logger.log(`Rolled back GCS upload for ${imageUrl}`);
            }
            catch (deleteError) {
                this.logger.error(`Failed to rollback GCS upload for ${imageUrl}: ${deleteError.message}`);
            }
            throw new common_1.InternalServerErrorException('Could not save image information.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async setThumbnail(productId, imageId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const image = await queryRunner.manager.findOne(product_image_entity_1.ProductImage, {
                where: { id: imageId, productId: productId },
            });
            if (!image) {
                throw new common_1.NotFoundException(`Image with ID "${imageId}" not found for product "${productId}".`);
            }
            await queryRunner.manager.update(product_image_entity_1.ProductImage, { productId: productId, isThumbnail: true }, { isThumbnail: false });
            image.isThumbnail = true;
            await queryRunner.manager.save(product_image_entity_1.ProductImage, image);
            await queryRunner.commitTransaction();
            this.logger.log(`Image ${imageId} set as thumbnail for product ${productId}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to set thumbnail for product ${productId}, image ${imageId}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Could not set thumbnail.');
        }
        finally {
            await queryRunner.release();
        }
    }
    async removeImage(productId, imageId) {
        const image = await this.imageRepository.findOne({
            where: { id: imageId, productId: productId },
        });
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID "${imageId}" not found for product "${productId}".`);
        }
        try {
            await this.cloudStorageService.deleteFile(image.imageUrl);
        }
        catch (error) {
            this.logger.error(`Failed to delete image from GCS for image ID ${imageId}, URL ${image.imageUrl}. Proceeding to delete DB record. Error: ${error.message}`);
        }
        try {
            const result = await this.imageRepository.delete(imageId);
            if (result.affected === 0) {
                throw new common_1.NotFoundException(`Image with ID "${imageId}" not found during deletion in DB.`);
            }
            this.logger.log(`Image record deleted successfully from DB: ID ${imageId}`);
        }
        catch (dbError) {
            this.logger.error(`Failed to delete image record ${imageId} from DB: ${dbError.message}`, dbError.stack);
            throw new common_1.InternalServerErrorException('Could not delete image information from database.');
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(2, (0, typeorm_1.InjectRepository)(product_image_entity_1.ProductImage)),
    __param(3, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(4, (0, typeorm_1.InjectRepository)(attribute_value_entity_1.AttributeValue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        cloud_storage_service_1.CloudStorageService])
], ProductsService);
//# sourceMappingURL=products.service.js.map