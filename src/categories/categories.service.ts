import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, description, parentId } = createCategoryDto;
    let parentCategory: Category | null = null;

    // 1. Kiểm tra Parent Category (nếu có)
    if (parentId) {
      parentCategory = await this.findOne(parentId); // Sử dụng findOne để đảm bảo parent tồn tại và chưa bị xóa mềm
      // findOne đã throw NotFoundException nếu không tìm thấy
    }

    // 2. Tạo Category mới
    const newCategory = this.categoryRepository.create({
      name,
      description,
      parentId: parentCategory?.id, // Gán parentId nếu có
      // parent: parentCategory // Hoặc gán cả object (tùy cách bạn muốn lưu)
    });

    // 3. Lưu vào DB
    try {
      const savedCategory = await this.categoryRepository.save(newCategory);
      this.logger.log(
        `Category created successfully: ${savedCategory.name} (ID: ${savedCategory.id})`,
      );
      return savedCategory;
    } catch (error) {
      // Xử lý lỗi unique constraint hoặc lỗi khác
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        // Mã lỗi unique violation của PostgreSQL
        throw new BadRequestException(
          `Category name '${name}' already exists.`,
        );
      }
      throw new InternalServerErrorException('Could not create category.');
    }
  }

  async findAll(): Promise<Category[]> {
    // Chỉ lấy các category chưa bị xóa mềm
    return this.categoryRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' }, // Sắp xếp theo tên
      // Thêm relations nếu cần load ngay lập tức (ví dụ: 'parent', 'children')
      // relations: ['parent']
    });
  }

  async findTree(): Promise<Category[]> {
    // Lấy tất cả danh mục chưa bị xóa
    const allCategories = await this.categoryRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    // Xây dựng cấu trúc cây thủ công
    const categoryMap = new Map<string, Category & { children?: Category[] }>();
    const rootCategories: Category[] = [];

    allCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] }); // Thêm thuộc tính children rỗng
    });

    allCategories.forEach((category) => {
      const categoryNode = categoryMap.get(category.id)!;
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parentNode = categoryMap.get(category.parentId)!;
        parentNode.children?.push(categoryNode); // Thêm vào children của parent
      } else {
        rootCategories.push(categoryNode); // Thêm vào danh sách gốc nếu không có parent hoặc parent không tồn tại trong map
      }
    });

    return rootCategories;
  }

  async findOne(id: string): Promise<Category> {
    if (!id) {
      throw new BadRequestException('Category ID cannot be empty');
    }
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      // relations: ['parent', 'children'] // Load thêm quan hệ nếu cần trả về chi tiết
    });

    if (!category) {
      this.logger.warn(`Category with ID "${id}" not found.`);
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const { name, description, parentId } = updateCategoryDto;

    // 1. Tìm category cần update (đảm bảo tồn tại và chưa bị xóa)
    const categoryToUpdate = await this.findOne(id);

    // 2. Kiểm tra logic Parent ID
    let parentCategory: Category | null | undefined = undefined; // undefined nghĩa là không thay đổi parent
    if (parentId !== undefined) {
      // Nếu parentId được cung cấp trong DTO (kể cả null)
      if (parentId === null) {
        // Muốn chuyển thành danh mục gốc
        parentCategory = null;
      } else {
        // Muốn gán parent mới
        if (parentId === id) {
          throw new BadRequestException('A category cannot be its own parent.');
        }
        // Tìm parent mới (đảm bảo tồn tại và chưa bị xóa)
        parentCategory = await this.findOne(parentId);

        // (Nâng cao) Kiểm tra circular dependency: parent mới không được là con cháu của category hiện tại
        // Cần một hàm đệ quy để kiểm tra, có thể bỏ qua nếu không quá quan trọng
      }
    }

    // 3. Cập nhật thuộc tính
    if (name) categoryToUpdate.name = name;
    if (description !== undefined) categoryToUpdate.description = description; // Cho phép xóa description
    if (parentCategory !== undefined) {
      // Chỉ cập nhật nếu parentId được gửi lên (kể cả null)
      categoryToUpdate.parentId = parentCategory ? parentCategory.id : null;
    }

    // 4. Lưu thay đổi
    try {
      const updatedCategory =
        await this.categoryRepository.save(categoryToUpdate);
      this.logger.log(
        `Category updated successfully: ${updatedCategory.name} (ID: ${id})`,
      );
      return updatedCategory;
    } catch (error) {
      this.logger.error(
        `Failed to update category ${id}: ${error.message}`,
        error.stack,
      );
      if (error.code === '23505') {
        // Unique constraint
        throw new BadRequestException(
          `Category name '${name}' already exists.`,
        );
      }
      throw new InternalServerErrorException('Could not update category.');
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryRepository.softDelete(id); // Sử dụng softDelete của TypeORM

    if (result.affected === 0) {
      this.logger.warn(`Category with ID "${id}" not found for deletion.`);
      throw new NotFoundException(`Category with ID "${id}" not found.`);
    }
    this.logger.log(`Category soft deleted successfully: ID ${id}`);
    // Soft delete không trả về entity, chỉ trả về UpdateResult
  }
}
