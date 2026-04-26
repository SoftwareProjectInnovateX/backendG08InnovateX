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

  @Put(':productCode/decrement-stock')
  async decrementStock(
    @Param('productCode') productCode: string,
    @Body() body: { quantity: number },
  ) {
    // ✅ Validate quantity is a positive number
    if (!body.quantity || body.quantity < 1 || !Number.isInteger(body.quantity)) {
      throw new BadRequestException('Quantity must be a positive integer');
    }
    // ✅ Validate productCode is not empty
    if (!productCode?.trim()) {
      throw new BadRequestException('Product code is required');
    }
    return this.productsService.decrementStock(productCode, body.quantity);
  }
}