import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminProductApprovalService } from './admin-product-approval.service.js';

class RejectDto {
  reason?: string;
}

@Controller('admin/pending-products')
export class AdminProductApprovalController {
  constructor(private readonly approvalService: AdminProductApprovalService) {}

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
}