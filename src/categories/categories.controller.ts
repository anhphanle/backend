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
  HttpCode,
  HttpStatus,
  Query, // Import Query nếu dùng pagination
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { Category } from './entities/category.entity';
// Import thêm các DTO cho pagination nếu cần

@Controller('categories') // Prefix /api/categories
@UseGuards(JwtAuthGuard, RolesGuard) // Áp dụng cho tất cả các route trong controller này
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // POST /api/categories
  @Post()
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager) // Chỉ Admin và ProductManager được tạo
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  // GET /api/categories (Danh sách phẳng)
  @Get()
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  ) // Mọi người đăng nhập đều có thể xem
  findAll(/* @Query() paginationDto: PaginationDto */): Promise<Category[]> {
    // Thêm logic phân trang nếu cần
    return this.categoriesService.findAll();
  }

  // GET /api/categories/tree (Danh sách dạng cây)
  @Get('tree')
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  ) // Mọi người đăng nhập đều có thể xem
  findTree(): Promise<Category[]> {
    return this.categoriesService.findTree();
  }

  // GET /api/categories/:id
  @Get(':id')
  @Roles(
    RoleEnum.Admin,
    RoleEnum.ProductManager,
    RoleEnum.InventoryManager,
    RoleEnum.Viewer,
  ) // Mọi người đăng nhập đều có thể xem
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    // ParseUUIDPipe kiểm tra ID hợp lệ
    return this.categoriesService.findOne(id);
  }

  // PATCH /api/categories/:id
  @Patch(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager) // Chỉ Admin và ProductManager được sửa
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // DELETE /api/categories/:id
  @Delete(':id')
  @Roles(RoleEnum.Admin, RoleEnum.ProductManager) // Chỉ Admin và ProductManager được xóa
  @HttpCode(HttpStatus.NO_CONTENT) // Trả về 204 No Content khi xóa thành công
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
