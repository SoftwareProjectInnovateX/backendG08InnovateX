import { Controller, Get, Post, Body } from '@nestjs/common';
import { ReturnsService } from './returns.service';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  async getReturns() {
    return this.returnsService.getReturns();
  }

  @Post()
  async submitReturn(@Body() body: any) {
    return this.returnsService.submitReturn(body);
  }
}