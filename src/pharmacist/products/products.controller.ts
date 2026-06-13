import { Controller, Get, Post, Put, Patch, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Get all customer-visible products ─────────────────────────────────────
  @Get()
  async getProducts(@Query('category') category?: string) {
    return this.productsService.getProducts(category);
  }

  // ── Get pending products from admin ───────────────────────────────────────
  @Get('pending')
  async getPendingProducts() {
    return this.productsService.getPendingProducts();
  }

  // ── Get all pharmacist products ────────────────────────────────────────────
  @Get('all')
  async getAllPharmacistProducts() {
    return this.productsService.getAllPharmacistProducts();
  }

  // ── Add a new product ──────────────────────────────────────────────────────
  @Post()
  async addProduct(@Body() body: any) {
    return this.productsService.addProduct(body);
  }

  // ── Approve a pending product (deletes from pendingProducts) ──────────────
  @Patch('pending/:id/approve')
  async approvePending(@Param('id') id: string) {
    return this.productsService.approvePending(id);
  }

  // ── Update product visibility ─────────────────────────────────────────────
  @Patch(':id/visibility')
  async updateVisibility(
    @Param('id') id: string,
    @Body() body: { visibility: string },
  ) {
    return this.productsService.updateVisibility(id, body.visibility);
  }

  // ── Decrement stock when added to cart ────────────────────────────────────
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

  // ── Increment stock ────────────────────────────────────────────────────────
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