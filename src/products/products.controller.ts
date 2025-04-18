import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe, // Giữ lại ParseFilePipe để validate file
  MaxFileSizeValidator, // Validator tùy chọn
  FileTypeValidator, // Validator tùy chọn
  BadRequestException, // Cần thiết để ném lỗi thủ công
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// Không cần diskStorage hay extname nếu dùng memoryStorage hoặc buffer mặc định
import { Express } from 'express'; // Import kiểu cho file Multer
import { ProductsService, PaginatedProductsResult } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto'; // Đã thêm import DTO này
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity'; // Đã thêm import Entity này
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // Import decorator nếu dùng
import { User } from '../users/entities/user.entity'; // Import User entity nếu dùng CurrentUser
import { UploadImageBodyDto } from './dto/upload-image-body.dto'; // Import DTO mới cho body ảnh
import { ProductImage } from './entities/product-image.entity';
// Cấu hình Multer (có thể để memoryStorage làm mặc định hoặc không cần khai báo storage)
const multerOptions = {
  // storage: memoryStorage(), // Khuyến nghị khi dùng buffer với cloud storage
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB mỗi file
};

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // Áp dụng Guard cho cả controller
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /api/products
  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  create(
    @Body() createProductDto: CreateProductDto,
    // @CurrentUser() user: User // Uncomment nếu cần lấy user hiện tại
  ): Promise<Product> {
    // return this.productsService.create(createProductDto, user.id); // Nếu truyền user ID
    return this.productsService.create(createProductDto);
  }

  // GET /api/products
  @Get()
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findAll(
    @Query() queryDto: ProductListQueryDto,
  ): Promise<PaginatedProductsResult> {
    return this.productsService.findAll(queryDto);
  }

  // GET /api/products/:id
  @Get(':id')
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  )
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  // PATCH /api/products/:id (Update thông tin Product gốc)
  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  // PATCH /api/products/variants/:variantId (Update thông tin Variant)
  @Patch('variants/:variantId')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() updateVariantDto: UpdateVariantDto, // Sử dụng DTO update variant
  ): Promise<ProductVariant> {
    // Trả về ProductVariant đã update
    return this.productsService.updateVariant(variantId, updateVariantDto);
  }

  // DELETE /api/products/:id (Xóa mềm Product và các Variants)
  @Delete(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.removeProduct(id);
  }

  // DELETE /api/products/variants/:variantId (Xóa mềm một Variant cụ thể)
  @Delete('variants/:variantId')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<void> {
    return this.productsService.removeVariant(variantId);
  }

  // --- Image Endpoints ---

  // POST /api/products/:id/images (Upload một ảnh)
  @Post(':id/images')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @UseInterceptors(FileInterceptor('image', multerOptions)) // 'image' là tên field trong form-data
  async addImage(
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFile(
      // Sử dụng ParseFilePipe để validate file
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }), // Regex không phân biệt hoa thường
        ],
        fileIsRequired: true, // Bắt buộc phải có file
      }),
    )
    file: Express.Multer.File,
    @Body() imageBody: UploadImageBodyDto, // Sử dụng DTO cho các trường text đi kèm
  ) {
    // Validation cho imageBody (variantId, altText, isThumbnail) được xử lý bởi Global ValidationPipe
    return this.productsService.addImage(
      productId,
      file,
      imageBody.variantId,
      imageBody.isThumbnail, // isThumbnail đã được transform thành boolean trong DTO
      imageBody.altText,
    );
  }

  // POST /api/products/:id/images/bulk (Upload nhiều ảnh - tùy chọn)
  @Post(':id/images/bulk')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions)) // 'images' là tên field, tối đa 10 file
  async addMultipleImages(
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFiles() // (Tùy chọn) Có thể thêm ParseFilePipe ở đây cho mảng files, nhưng cần cẩn thận
    // new ParseFilePipe({ ... })
    files: Array<Express.Multer.File>,
    @Body() imageBody: UploadImageBodyDto, // Dùng DTO cho các trường text đi kèm
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided.');
    }

    // (Tùy chọn) Validate từng file trong mảng nếu không dùng ParseFilePipe cho mảng
    // files.forEach(file => {
    //     if (file.size > 10 * 1024 * 1024) throw new BadRequestException(`File ${file.originalname} size exceeds 10MB limit.`);
    //     if (!file.mimetype.match(/(jpg|jpeg|png|gif|webp)$/i)) throw new BadRequestException(`File ${file.originalname} has invalid type.`);
    // });

    const results: ProductImage[] = [];
    for (const file of files) {
      const result = await this.productsService.addImage(
        productId,
        file,
        imageBody.variantId, // Gán tất cả ảnh cho cùng variant nếu có
        false, // Không set thumbnail mặc định khi upload bulk
        imageBody.altText, // Gán cùng altText nếu có
      );
      results.push(result);
    }
    return results; // Trả về mảng các ProductImage đã tạo
  }

  // PATCH /api/products/:productId/images/:imageId/thumbnail (Đặt làm thumbnail)
  @Patch(':productId/images/:imageId/thumbnail')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  setThumbnail(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productsService.setThumbnail(productId, imageId);
  }

  // DELETE /api/products/:productId/images/:imageId (Xóa ảnh)
  @Delete(':productId/images/:imageId')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<void> {
    return this.productsService.removeImage(productId, imageId);
  }
} // Kết thúc class ProductsController
