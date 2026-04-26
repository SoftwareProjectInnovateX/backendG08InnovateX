import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminProductApprovalService } from './admin-product-approval.service.js';

class RejectDto {
  reason?: string;
}

class CreateManualProductDto {
  productName: string;
  category: string;
  wholesalePrice: number;
  retailPrice?: number;
  stock: number;
  minStock: number;
  description?: string;
  manufacturer?: string;
}

@Controller('admin/pending-products')
export class AdminProductApprovalController {
  constructor(private readonly approvalService: AdminProductApprovalService) {}

  // GET /admin/pending-products/health
  @Get('health')
  health() {
    return { status: 'ok', version: '3.0 - with remove route' };
  }

  // GET /admin/pending-products
  @Get()
  getAllPending() {
    return this.approvalService.getAllPending();
  }

  // PATCH /admin/pending-products/:id/approve
  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.approvalService.approveProduct(id);
  }

  // PATCH /admin/pending-products/:id/reject
  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @Body() body: RejectDto) {
    return this.approvalService.rejectProduct(id, body.reason);
  }

  // DELETE /admin/pending-products/remove/:id
  @Delete('remove/:id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    console.log(`[AdminProductController] Deleting product: ${id}`);
    return this.approvalService.deleteProduct(id);
  }

  // POST /admin/pending-products/manual
  @Post('manual')
  @HttpCode(HttpStatus.CREATED)
  createManual(@Body() body: CreateManualProductDto) {
    return this.approvalService.createManualProduct(body);
  }
}
