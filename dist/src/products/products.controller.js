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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const update_variant_dto_1 = require("./dto/update-variant.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_enum_1 = require("../roles/roles.enum");
const product_list_query_dto_1 = require("./dto/product-list-query.dto");
const upload_image_body_dto_1 = require("./dto/upload-image-body.dto");
const multerOptions = {
    limits: { fileSize: 10 * 1024 * 1024 },
};
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    create(createProductDto) {
        return this.productsService.create(createProductDto);
    }
    findAll(queryDto) {
        return this.productsService.findAll(queryDto);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    updateProduct(id, updateProductDto) {
        return this.productsService.updateProduct(id, updateProductDto);
    }
    updateVariant(variantId, updateVariantDto) {
        return this.productsService.updateVariant(variantId, updateVariantDto);
    }
    removeProduct(id) {
        return this.productsService.removeProduct(id);
    }
    removeVariant(variantId) {
        return this.productsService.removeVariant(variantId);
    }
    async addImage(productId, file, imageBody) {
        return this.productsService.addImage(productId, file, imageBody.variantId, imageBody.isThumbnail, imageBody.altText);
    }
    async addMultipleImages(productId, files, imageBody) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No image files provided.');
        }
        const results = [];
        for (const file of files) {
            const result = await this.productsService.addImage(productId, file, imageBody.variantId, false, imageBody.altText);
            results.push(result);
        }
        return results;
    }
    setThumbnail(productId, imageId) {
        return this.productsService.setThumbnail(productId, imageId);
    }
    removeImage(productId, imageId) {
        return this.productsService.removeImage(productId, imageId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_list_query_dto_1.ProductListQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager, roles_enum_1.RoleEnum.InventoryManager, roles_enum_1.RoleEnum.Viewer),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Patch)('variants/:variantId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    __param(0, (0, common_1.Param)('variantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_variant_dto_1.UpdateVariantDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateVariant", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Delete)('variants/:variantId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('variantId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "removeVariant", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multerOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }),
        ],
        fileIsRequired: true,
    }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, upload_image_body_dto_1.UploadImageBodyDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "addImage", null);
__decorate([
    (0, common_1.Post)(':id/images/bulk'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, multerOptions)),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array,
        upload_image_body_dto_1.UploadImageBodyDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "addMultipleImages", null);
__decorate([
    (0, common_1.Patch)(':productId/images/:imageId/thumbnail'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "setThumbnail", null);
__decorate([
    (0, common_1.Delete)(':productId/images/:imageId'),
    (0, roles_decorator_1.Roles)(roles_enum_1.RoleEnum.Admin, roles_enum_1.RoleEnum.ProductManager),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "removeImage", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map