import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SupplierProductsService } from './supplier-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('supplier/products')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('supplier')
export class SupplierProductsController {
  constructor(private readonly productsService: SupplierProductsService) {}

  // GET /supplier/products?supplierId=xxx
  // Returns approved products shown in the "Active Products" tab
  @Get()
  getProducts(@Query('supplierId') supplierId: string) {
    return this.productsService.getProducts(supplierId);
  }

  // GET /supplier/products/pending?supplierId=xxx
  // Returns pending/rejected submissions shown in "Pending Approval" tab
  // NOTE: declared before :id so Express matches it first
  @Get('pending')
  getPendingProducts(@Query('supplierId') supplierId: string) {
    return this.productsService.getPendingProducts(supplierId);
  }

  // POST /supplier/products?supplierId=xxx&supplierName=xxx
  // Submits a new product for admin approval → saved to pendingProducts
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @Query('supplierId')   supplierId:   string,
    @Query('supplierName') supplierName: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(supplierId, supplierName, dto);
  }

  // PATCH /supplier/products/:id
  // Updates an already-approved product
  @Patch(':id')
  updateProduct(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productId, dto);
  }

  // DELETE /supplier/products/:id
  // Deletes an approved product from both products + adminProducts
  @Delete(':id')
  deleteProduct(@Param('id') productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}
