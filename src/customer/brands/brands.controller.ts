import { Controller, Get, Post, Body } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async getBrands() {
    return this.brandsService.getBrands();
  }

  @Post()
  async addBrand(@Body() body: any) {
    return this.brandsService.addBrand(body);
  }
}