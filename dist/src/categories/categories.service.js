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
var CategoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
let CategoriesService = CategoriesService_1 = class CategoriesService {
    categoryRepository;
    logger = new common_1.Logger(CategoriesService_1.name);
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createCategoryDto) {
        const { name, description, parentId } = createCategoryDto;
        let parentCategory = null;
        if (parentId) {
            parentCategory = await this.findOne(parentId);
        }
        const newCategory = this.categoryRepository.create({
            name,
            description,
            parentId: parentCategory?.id,
        });
        try {
            const savedCategory = await this.categoryRepository.save(newCategory);
            this.logger.log(`Category created successfully: ${savedCategory.name} (ID: ${savedCategory.id})`);
            return savedCategory;
        }
        catch (error) {
            this.logger.error(`Failed to create category: ${error.message}`, error.stack);
            if (error.code === '23505') {
                throw new common_1.BadRequestException(`Category name '${name}' already exists.`);
            }
            throw new common_1.InternalServerErrorException('Could not create category.');
        }
    }
    async findAll() {
        return this.categoryRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { name: 'ASC' },
        });
    }
    async findTree() {
        const allCategories = await this.categoryRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { name: 'ASC' },
        });
        const categoryMap = new Map();
        const rootCategories = [];
        allCategories.forEach((category) => {
            categoryMap.set(category.id, { ...category, children: [] });
        });
        allCategories.forEach((category) => {
            const categoryNode = categoryMap.get(category.id);
            if (category.parentId && categoryMap.has(category.parentId)) {
                const parentNode = categoryMap.get(category.parentId);
                parentNode.children?.push(categoryNode);
            }
            else {
                rootCategories.push(categoryNode);
            }
        });
        return rootCategories;
    }
    async findOne(id) {
        if (!id) {
            throw new common_1.BadRequestException('Category ID cannot be empty');
        }
        const category = await this.categoryRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            this.logger.warn(`Category with ID "${id}" not found.`);
            throw new common_1.NotFoundException(`Category with ID "${id}" not found.`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const { name, description, parentId } = updateCategoryDto;
        const categoryToUpdate = await this.findOne(id);
        let parentCategory = undefined;
        if (parentId !== undefined) {
            if (parentId === null) {
                parentCategory = null;
            }
            else {
                if (parentId === id) {
                    throw new common_1.BadRequestException('A category cannot be its own parent.');
                }
                parentCategory = await this.findOne(parentId);
            }
        }
        if (name)
            categoryToUpdate.name = name;
        if (description !== undefined)
            categoryToUpdate.description = description;
        if (parentCategory !== undefined) {
            categoryToUpdate.parentId = parentCategory ? parentCategory.id : null;
        }
        try {
            const updatedCategory = await this.categoryRepository.save(categoryToUpdate);
            this.logger.log(`Category updated successfully: ${updatedCategory.name} (ID: ${id})`);
            return updatedCategory;
        }
        catch (error) {
            this.logger.error(`Failed to update category ${id}: ${error.message}`, error.stack);
            if (error.code === '23505') {
                throw new common_1.BadRequestException(`Category name '${name}' already exists.`);
            }
            throw new common_1.InternalServerErrorException('Could not update category.');
        }
    }
    async remove(id) {
        const result = await this.categoryRepository.softDelete(id);
        if (result.affected === 0) {
            this.logger.warn(`Category with ID "${id}" not found for deletion.`);
            throw new common_1.NotFoundException(`Category with ID "${id}" not found.`);
        }
        this.logger.log(`Category soft deleted successfully: ID ${id}`);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = CategoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map