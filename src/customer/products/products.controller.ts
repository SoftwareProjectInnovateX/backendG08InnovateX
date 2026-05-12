import { Controller, Get, Put, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // get all products (optionally filtered by category)
  @Get()
  async getProducts(@Query('category') category?: string) {
    return this.productsService.getProducts(category);
  }
   //reduce stock by 1 when added to cart
  @Put(':productCode/decrement-stock')
  async decrementStock(
    @Param('productCode') productCode: string,
    @Body() body: { quantity: number },
  ) {
    if (!body.quantity || body.quantity < 1 || !Number.isInteger(body.quantity)) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
    if (!productCode?.trim()) {
      throw new BadRequestException('Product code is required');
    }
    return this.productsService.decrementStock(productCode, body.quantity);
  }

  @Put(':productCode/increment-stock')
  async incrementStock(
    @Param('productCode') productCode: string,
    @Body() body: { quantity: number },
  ) {
    if (!body.quantity || body.quantity < 1 || !Number.isInteger(body.quantity)) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
    if (!productCode?.trim()) {
      throw new BadRequestException('Product code is required');
    }
    return this.productsService.incrementStock(productCode, body.quantity);
  }
}