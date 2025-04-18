import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  InventoryService,
  PaginatedInventoryLogsResult,
} from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryHistoryQueryDto } from './dto/inventory-history-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InventoryLog } from './entities/inventory-log.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ tất cả các route
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // POST /api/inventory/adjust
  @Post('adjust')
  @Roles(RoleEnum.Admin, RoleEnum.InventoryManager) // Chỉ Admin và InventoryManager được điều chỉnh kho
  adjustStock(
    @Body() adjustDto: AdjustStockDto,
    @CurrentUser() user: User, // Lấy user đang đăng nhập
  ): Promise<InventoryLog> {
    // Trả về log vừa tạo
    return this.inventoryService.adjustStock(adjustDto, user.id);
  }

  // GET /api/inventory/history/:variantId
  @Get('history/:variantId')
  @Roles(RoleEnum.Admin, RoleEnum.InventoryManager, RoleEnum.ProductManager) // Cho phép Product Manager xem lịch sử kho
  getHistory(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Query() queryDto: InventoryHistoryQueryDto,
  ): Promise<PaginatedInventoryLogsResult> {
    return this.inventoryService.getHistory(variantId, queryDto);
  }
}
