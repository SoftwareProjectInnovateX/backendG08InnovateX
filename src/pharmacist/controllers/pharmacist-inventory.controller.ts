import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PharmacistInventoryService } from '../services/pharmacist-inventory.service.js';

@Controller('pharmacist/inventory')
export class PharmacistInventoryController {
  constructor(private readonly inventoryService: PharmacistInventoryService) {}

  @Get()
  async getInventory() {
    return this.inventoryService.getInventory();
  }

  @Post()
  async addInventoryItem(@Body() itemData: any) {
    return this.inventoryService.addInventoryItem(itemData);
  }

  @Put(':id')
  async updateInventoryItem(@Param('id') id: string, @Body() updateData: any) {
    return this.inventoryService.updateInventoryItem(id, updateData);
  }

  @Delete(':id')
  async deleteInventoryItem(@Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem(id);
  }
}
