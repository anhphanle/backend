import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  SelectQueryBuilder,
  Brackets,
  IsNull,
} from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { AttributeValue } from '../attributes/entities/attribute-value.entity';
import {
  InventoryLog,
  InventoryLogReason,
} from '../inventory/entities/inventory-log.entity'; // Sẽ cần Inventory Module

import { CreateProductDto } from './dto/create-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import {
  ProductListQueryDto,
  ProductSortBy,
} from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';

// Interface cho kết quả phân trang
export interface PaginatedProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Category) // Cần để kiểm tra category tồn tại
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(AttributeValue) // Cần để kiểm tra attribute value tồn tại
    private readonly attributeValueRepository: Repository<AttributeValue>,
    // @InjectRepository(InventoryLog) // Sẽ inject khi có Inventory Module
    // private readonly inventoryLogRepository: Repository<InventoryLog>,
    private readonly dataSource: DataSource, // Inject DataSource để sử dụng transaction
    // Thêm CloudStorageService vào constructor
    private readonly cloudStorageService: CloudStorageService,
  ) {}

  async create(
    createProductDto: CreateProductDto /* userId: string */,
  ): Promise<Product> {
    // userId để ghi log tồn kho
    const { categoryId, variants, ...productData } = createProductDto;

    // Sử dụng transaction để đảm bảo tính toàn vẹn
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra Category tồn tại
      const category = await queryRunner.manager.findOne(Category, {
        where: { id: categoryId, deletedAt: IsNull() },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with ID "${categoryId}" not found or has been deleted.`,
        );
      }

      // 2. Tạo Product gốc
      const product = queryRunner.manager.create(Product, {
        ...productData,
        categoryId: category.id,
        // category: category // Hoặc gán object
      });
      const savedProduct = await queryRunner.manager.save(Product, product);
      this.logger.log(
        `Product entity created: ${savedProduct.name} (ID: ${savedProduct.id})`,
      );

      // 3. Tạo các Variants và liên kết Attribute Values
      const savedVariants: ProductVariant[] = [];
      for (const variantDto of variants) {
        const { attributeValueIds, ...variantData } = variantDto;

        // 3a. Kiểm tra SKU unique (trong transaction)
        const existingSku = await queryRunner.manager.findOne(ProductVariant, {
          where: { sku: variantData.sku },
        });
        if (existingSku) {
          throw new ConflictException(
            `SKU "${variantData.sku}" already exists.`,
          );
        }

        // 3b. Tìm các AttributeValue objects (trong transaction)
        let foundAttributeValues: AttributeValue[] = [];
        if (attributeValueIds && attributeValueIds.length > 0) {
          // Dùng In để tìm nhiều ID cùng lúc
          foundAttributeValues = await queryRunner.manager.findByIds(
            AttributeValue,
            attributeValueIds,
          );
          if (foundAttributeValues.length !== attributeValueIds.length) {
            const notFoundIds = attributeValueIds.filter(
              (id) => !foundAttributeValues.some((av) => av.id === id),
            );
            throw new BadRequestException(
              `AttributeValue IDs not found: ${notFoundIds.join(', ')}`,
            );
          }
          // (Nâng cao) Kiểm tra xem các attribute value này có thuộc cùng một attribute không, hoặc có đúng với category không?
        }

        // 3c. Tạo ProductVariant
        const variant = queryRunner.manager.create(ProductVariant, {
          ...variantData,
          productId: savedProduct.id,
          attributeValues: foundAttributeValues, // Gán mảng các object AttributeValue
        });
        const savedVariant = await queryRunner.manager.save(
          ProductVariant,
          variant,
        );
        this.logger.log(
          `Variant created: SKU ${savedVariant.sku} for Product ID ${savedProduct.id}`,
        );
        savedVariants.push(savedVariant);

        // 3d. Ghi log tồn kho ban đầu (Sẽ làm khi có Inventory Module)
        if (variantData.quantity > 0) {
          // const inventoryLog = queryRunner.manager.create(InventoryLog, {
          //     productVariantId: savedVariant.id,
          //     changeQuantity: variantData.quantity,
          //     newQuantity: variantData.quantity, // Số lượng mới là số lượng ban đầu
          //     reason: InventoryLogReason.INITIAL_STOCK,
          //     userId: userId, // ID của người tạo sản phẩm
          //     notes: 'Initial stock on product creation'
          // });
          // await queryRunner.manager.save(InventoryLog, inventoryLog);
          // this.logger.log(`Initial inventory log created for SKU ${savedVariant.sku}: +${variantData.quantity}`);
        }
      }

      // 4. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(
        `Product "${savedProduct.name}" and its variants created successfully.`,
      );

      // Load lại product với các relations vừa tạo để trả về (nếu cần)
      // Hoặc chỉ trả về ID/thông tin cơ bản
      // return this.findOne(savedProduct.id); // Gọi findOne để load đầy đủ
      return savedProduct; // Trả về product gốc đã lưu
    } catch (error) {
      // 5. Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to create product transaction: ${error.message}`,
        error.stack,
      );
      // Ném lại lỗi đã bắt được hoặc lỗi chung chung
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create product due to an internal error.',
      );
    } finally {
      // 6. Release query runner
      await queryRunner.release();
    }
  }

  async findAll(
    queryDto: ProductListQueryDto,
  ): Promise<PaginatedProductsResult> {
    const {
      search,
      categoryId,
      status,
      sortBy,
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder: SelectQueryBuilder<Product> = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category') // Join với category để lấy tên
      .leftJoin('product.variants', 'variant') // Join với variant để tìm theo SKU
      .leftJoinAndSelect(
        'product.images',
        'thumbnailImage',
        'thumbnailImage.isThumbnail = true',
      ) // Join để lấy ảnh thumbnail
      .where('product.deletedAt IS NULL'); // Chỉ lấy sản phẩm chưa xóa mềm

    // Apply Filters
    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
      // (Nâng cao) Có thể cần tìm cả trong các category con
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('variant.sku ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // Apply Sorting
    switch (sortBy) {
      case ProductSortBy.NAME_ASC:
        queryBuilder.orderBy('product.name', 'ASC');
        break;
      case ProductSortBy.NAME_DESC:
        queryBuilder.orderBy('product.name', 'DESC');
        break;
      case ProductSortBy.CREATED_AT_ASC:
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      case ProductSortBy.CREATED_AT_DESC:
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    // Apply Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    if (!id) throw new BadRequestException('Product ID cannot be empty');

    // Sử dụng queryBuilder để load relations phức tạp hơn
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect(
        'product.variants',
        'variant',
        'variant.deletedAt IS NULL',
      ) // Chỉ lấy variant chưa xóa mềm
      .leftJoinAndSelect('variant.attributeValues', 'attributeValue')
      .leftJoinAndSelect('attributeValue.attribute', 'attribute') // Load cả tên attribute
      .leftJoinAndSelect('product.images', 'image') // Load tất cả ảnh
      .leftJoinAndSelect('variant.images', 'variantImage') // Load ảnh riêng của variant
      // .leftJoinAndSelect('variant.promotions', 'promotion', 'promotion.isActive = true AND promotion.startDate <= NOW() AND promotion.endDate >= NOW()') // Load promotion đang active (ví dụ)
      .where('product.id = :id', { id })
      .andWhere('product.deletedAt IS NULL') // Chỉ lấy sản phẩm chưa xóa mềm
      .orderBy({
        'variant.createdAt': 'ASC', // Sắp xếp variant theo thứ tự tạo
        'image.displayOrder': 'ASC', // Sắp xếp ảnh theo thứ tự hiển thị
        'image.createdAt': 'ASC',
        'variantImage.displayOrder': 'ASC',
        'variantImage.createdAt': 'ASC',
      })
      .getOne(); // Dùng getOne vì tìm theo ID

    if (!product) {
      this.logger.warn(`Product with ID "${id}" not found.`);
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { categoryId, ...productData } = updateProductDto;

    // 1. Tìm sản phẩm cần cập nhật (đảm bảo tồn tại và chưa bị xóa)
    const productToUpdate = await this.findOne(id); // findOne đã bao gồm check deletedAt

    // 2. Kiểm tra Category mới (nếu có thay đổi)
    if (categoryId && categoryId !== productToUpdate.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId, deletedAt: IsNull() },
      });
      if (!category) {
        throw new BadRequestException(
          `New category with ID "${categoryId}" not found or has been deleted.`,
        );
      }
      productToUpdate.categoryId = categoryId;
      // productToUpdate.category = category; // Gán object nếu cần
    }

    // 3. Merge dữ liệu mới vào entity đã tìm thấy
    // TypeORM's merge handles partial updates gracefully
    this.productRepository.merge(productToUpdate, productData);

    // 4. Lưu thay đổi
    try {
      const updatedProduct = await this.productRepository.save(productToUpdate);
      this.logger.log(
        `Product updated successfully: ${updatedProduct.name} (ID: ${id})`,
      );
      // Trả về product đã được load đầy đủ thông tin nếu cần thiết
      // return this.findOne(id);
      return updatedProduct; // Hoặc chỉ trả về entity đã update
    } catch (error) {
      this.logger.error(
        `Failed to update product ${id}: ${error.message}`,
        error.stack,
      );
      // Bắt các lỗi cụ thể nếu cần, ví dụ unique constraint cho 'name' nếu có
      throw new InternalServerErrorException('Could not update product.');
    }
  }

  async updateVariant(
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<ProductVariant> {
    const { sku, attributeValueIds, ...variantData } = updateVariantDto;

    // Sử dụng transaction vì có thể cần cập nhật cả variant và bảng M-M variant_attribute_values
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tìm variant cần cập nhật (đảm bảo tồn tại và chưa bị xóa)
      const variantToUpdate = await queryRunner.manager.findOne(
        ProductVariant,
        {
          where: { id: variantId, deletedAt: IsNull() },
          relations: ['attributeValues'], // Load các attribute values hiện tại để so sánh
        },
      );
      if (!variantToUpdate) {
        throw new NotFoundException(
          `Product variant with ID "${variantId}" not found.`,
        );
      }

      // 2. Kiểm tra SKU mới (nếu có thay đổi)
      if (sku && sku !== variantToUpdate.sku) {
        const existingSku = await queryRunner.manager.findOne(ProductVariant, {
          where: { sku: sku },
        });
        if (existingSku && existingSku.id !== variantId) {
          // Đảm bảo không phải chính nó
          throw new ConflictException(
            `SKU "${sku}" already exists for another variant.`,
          );
        }
        variantToUpdate.sku = sku;
      }

      // 3. Cập nhật các thuộc tính khác (price...)
      // merge không hoạt động tốt với transaction manager, gán thủ công
      if (variantData.price !== undefined)
        variantToUpdate.price = variantData.price;
      // Không cập nhật quantity ở đây, nó thuộc về Inventory Module

      // 4. Xử lý Attribute Values (nếu có thay đổi)
      if (attributeValueIds !== undefined) {
        // Tìm các AttributeValue objects mới
        let newAttributeValues: AttributeValue[] = [];
        if (attributeValueIds.length > 0) {
          newAttributeValues = await queryRunner.manager.findByIds(
            AttributeValue,
            attributeValueIds,
          );
          if (newAttributeValues.length !== attributeValueIds.length) {
            const notFoundIds = attributeValueIds.filter(
              (id) => !newAttributeValues.some((av) => av.id === id),
            );
            throw new BadRequestException(
              `AttributeValue IDs not found: ${notFoundIds.join(', ')}`,
            );
          }
        }
        // Gán trực tiếp mảng mới vào quan hệ ManyToMany
        // TypeORM sẽ tự động xử lý việc thêm/xóa trong bảng trung gian variant_attribute_values khi save
        variantToUpdate.attributeValues = newAttributeValues;
      }

      // 5. Lưu thay đổi variant (bao gồm cả cập nhật bảng M-M)
      const updatedVariant = await queryRunner.manager.save(
        ProductVariant,
        variantToUpdate,
      );

      // 6. Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(
        `Variant updated successfully: SKU ${updatedVariant.sku} (ID: ${variantId})`,
      );
      return updatedVariant; // Trả về variant đã cập nhật (có thể cần load lại relations)
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to update variant transaction ${variantId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update variant due to an internal error.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async removeProduct(id: string): Promise<void> {
    // Sử dụng transaction để xóa mềm cả Product và các Variant liên quan
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tìm sản phẩm (check tồn tại)
      const product = await queryRunner.manager.findOne(Product, {
        where: { id, deletedAt: IsNull() },
        relations: ['variants'],
      });
      if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found.`);
      }

      // 2. Xóa mềm các variant liên quan (nếu có)
      const variantIds = product.variants.map((v) => v.id);
      if (variantIds.length > 0) {
        // Kiểm tra xem có variant nào bị chặn xóa do Inventory Log không (ON DELETE RESTRICT)
        // TypeORM softDelete không check FK constraints, nên phải check thủ công hoặc bắt lỗi DB
        // Cách đơn giản là cứ thử xóa mềm, nếu lỗi FK thì báo lỗi
        try {
          await queryRunner.manager.softDelete(ProductVariant, variantIds);
          this.logger.log(
            `Soft deleted variants for product ${id}: ${variantIds.join(', ')}`,
          );
        } catch (error) {
          // Kiểm tra mã lỗi FK violation (ví dụ: 23503 ở PostgreSQL)
          if (
            error.code === '23503' &&
            error.constraint?.includes('fk_log_variant')
          ) {
            this.logger.error(
              `Cannot delete product ${id} because one or more variants have inventory history.`,
            );
            throw new ConflictException(
              'Cannot delete product. Some variants have inventory history.',
            );
          }
          throw error; // Ném lại lỗi khác
        }
      }

      // 3. Xóa mềm Product gốc
      await queryRunner.manager.softDelete(Product, id);

      // 4. Commit
      await queryRunner.commitTransaction();
      this.logger.log(`Product soft deleted successfully: ID ${id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to soft delete product transaction ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Could not soft delete product.');
    } finally {
      await queryRunner.release();
    }
  }

  async removeVariant(variantId: string): Promise<void> {
    // Sử dụng transaction để đảm bảo check constraint trước khi xóa
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. Tìm variant (check tồn tại)
      const variant = await queryRunner.manager.findOne(ProductVariant, {
        where: { id: variantId, deletedAt: IsNull() },
      });
      if (!variant) {
        throw new NotFoundException(
          `Product variant with ID "${variantId}" not found.`,
        );
      }

      // 2. Kiểm tra ràng buộc Inventory Log trước khi xóa mềm
      // TypeORM softDelete không check constraint, cần check thủ công
      // const logCount = await queryRunner.manager.count(InventoryLog, { where: { productVariantId: variantId } });
      // if (logCount > 0) {
      //     throw new ConflictException('Cannot delete variant. It has inventory history.');
      // }
      // Hoặc: Cứ thử xóa mềm và bắt lỗi FK constraint như trong removeProduct

      // 3. Thực hiện xóa mềm
      try {
        const result = await queryRunner.manager.softDelete(
          ProductVariant,
          variantId,
        );
        if (result.affected === 0) {
          // Trường hợp này ít xảy ra vì đã check findOne ở trên
          throw new NotFoundException(
            `Product variant with ID "${variantId}" not found during deletion.`,
          );
        }
      } catch (error) {
        if (
          error.code === '23503' &&
          error.constraint?.includes('fk_log_variant')
        ) {
          this.logger.error(
            `Cannot delete variant ${variantId} because it has inventory history.`,
          );
          throw new ConflictException(
            'Cannot delete variant. It has inventory history.',
          );
        }
        throw error; // Ném lại lỗi khác
      }

      // 4. Commit
      await queryRunner.commitTransaction();
      this.logger.log(`Variant soft deleted successfully: ID ${variantId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to soft delete variant transaction ${variantId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Could not soft delete variant.');
    } finally {
      await queryRunner.release();
    }
  }

  async addImage(
    productId: string,
    file: Express.Multer.File, // File nhận từ Multer
    variantId?: string,
    isThumbnail: boolean = false,
    altText?: string,
  ): Promise<ProductImage> {
    if (!file) {
      throw new BadRequestException('No image file provided.');
    }

    // 1. Kiểm tra Product tồn tại
    const product = await this.productRepository.findOne({
      where: { id: productId, deletedAt: IsNull() },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found.`);
    }

    // 2. Kiểm tra Variant tồn tại (nếu có variantId)
    let variant: ProductVariant | null = null;
    if (variantId) {
      variant = await this.variantRepository.findOne({
        where: { id: variantId, productId: productId, deletedAt: IsNull() },
      });
      if (!variant) {
        throw new NotFoundException(
          `Variant with ID "${variantId}" not found for product "${productId}".`,
        );
      }
    }

    // 3. Upload file lên GCS
    let imageUrl: string;
    try {
      imageUrl = await this.cloudStorageService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        `products/${productId}/`, // Lưu vào thư mục con theo ID sản phẩm
      );
    } catch (error) {
      // Lỗi đã được log trong CloudStorageService, chỉ cần ném lại hoặc ném lỗi cụ thể hơn
      throw new InternalServerErrorException(
        'Failed to upload image to cloud storage.',
      );
    }

    // Sử dụng transaction để đảm bảo tính nhất quán khi set thumbnail
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 4. Nếu đặt làm thumbnail, bỏ thumbnail cũ (nếu có)
      if (isThumbnail) {
        await queryRunner.manager.update(
          ProductImage,
          { productId: productId, isThumbnail: true }, // Điều kiện tìm ảnh thumbnail cũ
          { isThumbnail: false }, // Giá trị cập nhật
        );
        this.logger.log(`Unset previous thumbnail for product ${productId}`);
      }

      // 5. Tạo và lưu bản ghi ProductImage vào DB
      const newImage = queryRunner.manager.create(ProductImage, {
        productId: productId,
        variantId: variantId, // Có thể là null
        imageUrl: imageUrl,
        altText: altText,
        isThumbnail: isThumbnail,
        // displayOrder: tính toán logic nếu cần
      });
      const savedImage = await queryRunner.manager.save(ProductImage, newImage);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Image added successfully for product ${productId}. Image ID: ${savedImage.id}, URL: ${imageUrl}`,
      );
      return savedImage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to add image record for product ${productId}: ${error.message}`,
        error.stack,
      );
      // Cố gắng xóa file đã upload lên GCS nếu việc lưu DB thất bại
      try {
        await this.cloudStorageService.deleteFile(imageUrl); // Truyền URL để service tự parse filename
        this.logger.log(`Rolled back GCS upload for ${imageUrl}`);
      } catch (deleteError) {
        this.logger.error(
          `Failed to rollback GCS upload for ${imageUrl}: ${deleteError.message}`,
        );
        // Không cần throw lỗi ở đây vì lỗi chính là từ DB
      }
      throw new InternalServerErrorException(
        'Could not save image information.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async setThumbnail(productId: string, imageId: string): Promise<void> {
    // Sử dụng transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1. Kiểm tra Product và Image tồn tại và thuộc về nhau
      const image = await queryRunner.manager.findOne(ProductImage, {
        where: { id: imageId, productId: productId },
      });
      if (!image) {
        throw new NotFoundException(
          `Image with ID "${imageId}" not found for product "${productId}".`,
        );
      }

      // 2. Bỏ thumbnail cũ
      await queryRunner.manager.update(
        ProductImage,
        { productId: productId, isThumbnail: true },
        { isThumbnail: false },
      );

      // 3. Đặt thumbnail mới
      image.isThumbnail = true;
      await queryRunner.manager.save(ProductImage, image);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Image ${imageId} set as thumbnail for product ${productId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to set thumbnail for product ${productId}, image ${imageId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Could not set thumbnail.');
    } finally {
      await queryRunner.release();
    }
  }

  async removeImage(productId: string, imageId: string): Promise<void> {
    // 1. Tìm thông tin ảnh trong DB
    const image = await this.imageRepository.findOne({
      where: { id: imageId, productId: productId },
    });
    if (!image) {
      throw new NotFoundException(
        `Image with ID "${imageId}" not found for product "${productId}".`,
      );
    }

    // 2. Xóa file trên GCS trước
    try {
      await this.cloudStorageService.deleteFile(image.imageUrl); // Truyền URL
    } catch (error) {
      // Lỗi đã được log trong CloudStorageService
      // Quyết định xem có nên dừng lại hay vẫn xóa trong DB
      // Nếu file trên GCS không có nhưng DB có -> nên xóa DB
      // Nếu lỗi khác (ví dụ: network) -> có thể dừng lại
      this.logger.error(
        `Failed to delete image from GCS for image ID ${imageId}, URL ${image.imageUrl}. Proceeding to delete DB record. Error: ${error.message}`,
      );
      // throw new InternalServerErrorException('Failed to delete image from cloud storage.'); // Uncomment nếu muốn dừng lại
    }

    // 3. Xóa bản ghi trong DB
    try {
      const result = await this.imageRepository.delete(imageId);
      if (result.affected === 0) {
        // Trường hợp hiếm khi xảy ra nếu findOne ở trên thành công
        throw new NotFoundException(
          `Image with ID "${imageId}" not found during deletion in DB.`,
        );
      }
      this.logger.log(
        `Image record deleted successfully from DB: ID ${imageId}`,
      );
    } catch (dbError) {
      this.logger.error(
        `Failed to delete image record ${imageId} from DB: ${dbError.message}`,
        dbError.stack,
      );
      throw new InternalServerErrorException(
        'Could not delete image information from database.',
      );
    }
  }
}
