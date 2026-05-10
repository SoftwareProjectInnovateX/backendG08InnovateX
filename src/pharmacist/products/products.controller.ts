import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Pending products from admin (products collection) ──────────────────────
  @Get('pending')
  async getPendingProducts() {
    return this.productsService.getPendingProducts();
  }

  // ── All pharmacist products (pharmacistProducts collection) ────────────────
  @Get()
  async getAllPharmacistProducts() {
    return this.productsService.getAllPharmacistProducts();
  }

  // ── Customer-visible products only ─────────────────────────────────────────
  // Your customer page should call GET /products/customer
  @Get('customer')
  async getCustomerProducts() {
    return this.productsService.getCustomerProducts();
  }

  // ── Mark admin product as pharmacist-approved ──────────────────────────────
  @Patch('pending/:id/approve')
  async approvePending(@Param('id') id: string) {
    return this.productsService.approvePending(id);
  }

  // ── Add product to pharmacistProducts (with visibility) ───────────────────
  @Post()
  async addProduct(@Body() body: any) {
    return this.productsService.addProduct(body);
  }

  // ── Toggle visibility of an existing pharmacistProduct ────────────────────
  // Called by PharmacistProductsPage toggle button
  // Body: { visibility: "customer" | "pharmacist_only" }
  @Patch(':id/visibility')
  async updateVisibility(
    @Param('id') id: string,
    @Body() body: { visibility: string },
  ) {
    return this.productsService.updateVisibility(id, body.visibility);
  }
}