import { Controller, Post, Body } from '@nestjs/common';
import { AiAnalyticsService } from './ai-analytics.service.js';
import { AnalyseInvoicesDto } from './dto/ai-analytics.dto.js';

@Controller('ai')
export class AiAnalyticsController {
  constructor(private readonly aiAnalyticsService: AiAnalyticsService) {}

  @Post('supply-recommendations')
  supplyRecommendations(@Body() dto: AnalyseInvoicesDto) {
    return this.aiAnalyticsService.supplyRecommendations(dto);
  }

  @Post('demand-forecast')
  demandForecast(@Body() dto: AnalyseInvoicesDto) {
    return this.aiAnalyticsService.demandForecast(dto);
  }

  @Post('payment-risk')
  paymentRisk(@Body() dto: AnalyseInvoicesDto) {
    return this.aiAnalyticsService.paymentRisk(dto);
  }

  @Post('restock-suggestions')
  restockSuggestions(@Body() dto: AnalyseInvoicesDto) {
    return this.aiAnalyticsService.restockSuggestions(dto);
  }
}