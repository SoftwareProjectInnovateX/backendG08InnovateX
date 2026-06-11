import { Controller, Get, Param } from '@nestjs/common';
import { ForecastService } from './forecast.service.js';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get()
  async getForecast() {
    return this.forecastService.getForecast();
  }

 
  @Get('insight/:productId')
  async getInsight(@Param('productId') productId: string) {
    return this.forecastService.getAiInsight(productId);
  }
}