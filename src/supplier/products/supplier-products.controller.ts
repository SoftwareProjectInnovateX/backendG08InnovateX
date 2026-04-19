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
} from '@nestjs/common';
import { SupplierProductsService } from './supplier-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('supplier/products')
export class SupplierProductsController {
  constructor(private readonly productsService: SupplierProductsService) {}

  // GET /supplier/products?supplierId=xxx
  @Get()
  getProducts(@Query('supplierId') supplierId: string) {
    return this.productsService.getProducts(supplierId);
  }

  // GET /supplier/products/pending?supplierId=xxx
  // NOTE: must be declared before :id routes so Express matches it first
  @Get('pending')
  getPendingProducts(@Query('supplierId') supplierId: string) {
    return this.productsService.getPendingProducts(supplierId);
  }

  // POST /supplier/products
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @Query('supplierId') supplierId: string,
    @Query('supplierName') supplierName: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(supplierId, supplierName, dto);
  }

  // PATCH /supplier/products/:id
  @Patch(':id')
  updateProduct(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(productId, dto);
  }

  // DELETE /supplier/products/:id
  @Delete(':id')
  deleteProduct(@Param('id') productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}