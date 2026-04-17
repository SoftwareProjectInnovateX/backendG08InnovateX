import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SupplierProductsService } from './supplier-products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('supplier/products')
export class SupplierProductsController {
  constructor(private readonly productsService: SupplierProductsService) {}

  // GET /supplier/products?supplierId=xxx
  // Called instead of fetchProducts() in ProductCatalog.jsx
  @Get()
  getProducts(@Query('supplierId') supplierId: string) {
    return this.productsService.getProducts(supplierId);
  }

  // POST /supplier/products
  // Called instead of handleAddProduct() in ProductCatalog.jsx
  // Returns { productId, productCode } — frontend shows productCode in success alert
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
  // Called instead of handleUpdateProduct() in ProductCatalog.jsx
  @Patch(':id')
  updateProduct(@Param('id') productId: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(productId, dto);
  }

  // DELETE /supplier/products/:id
  // Called instead of handleDeleteProduct() in ProductCatalog.jsx
  @Delete(':id')
  deleteProduct(@Param('id') productId: string) {
    return this.productsService.deleteProduct(productId);
  }
}