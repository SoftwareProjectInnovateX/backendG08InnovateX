import { Controller, Get, Put, Param, Body, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id/loyalty')
  @HttpCode(200)
  addLoyalty(@Param('id') id: string, @Body('points') points: number) {
    return this.usersService.addLoyaltyPoints(id, Number(points));
  }

  @Put(':id/status')
  @HttpCode(200)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.usersService.updateStatus(id, status);
  }
}
