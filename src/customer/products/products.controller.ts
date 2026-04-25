import { Controller, Get, Put, Param, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query('category') category?: string) {
    return this.productsService.getProducts(category);
  }

  @Put(':productCode/decrement-stock')
  async decrementStock(
    @Param('productCode') productCode: string,
    @Body() body: { quantity: number },
  ) {
    return this.productsService.decrementStock(productCode, body.quantity ?? 1);
  }
}