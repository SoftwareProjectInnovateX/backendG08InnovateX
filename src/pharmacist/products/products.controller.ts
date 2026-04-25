import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('pending')
  async getPendingProducts() {
    return this.productsService.getPendingProducts();
  }

  @Patch('pending/:id/approve')
  async approvePending(@Param('id') id: string) {
    return this.productsService.approvePending(id);
  }

  @Post()
  async addProduct(@Body() body: any) {
    return this.productsService.addProduct(body);
  }
}