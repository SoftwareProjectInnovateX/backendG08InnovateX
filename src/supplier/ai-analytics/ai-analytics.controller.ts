import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

import { AiAnalyticsService } from './ai-analytics.service.js';
import {
  AnalyseInvoicesDto,
  GenerateSummaryPdfDto,
  GenerateBusinessAdvisorDto,
} from './dto/ai-analytics.dto.js';

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

  // Groq-powered business advisor
  @Post('business-advisor')
  @HttpCode(HttpStatus.OK)
  async businessAdvisor(@Body() dto: GenerateBusinessAdvisorDto) {
    return await this.aiAnalyticsService.businessAdvisor(dto);
  }

  @Post('generate-summary-pdf')
  @HttpCode(HttpStatus.OK)
  async generateSummaryPdf(
    @Body() dto: GenerateSummaryPdfDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.aiAnalyticsService.generateSummaryPdf(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="AI-Analytics-Summary-${
        new Date(dto.generatedAt).toISOString().split('T')[0]
      }.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
