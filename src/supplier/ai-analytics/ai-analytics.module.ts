import { Module } from '@nestjs/common';
import { AiAnalyticsController } from './ai-analytics.controller.js';
import { AiAnalyticsService } from './ai-analytics.service.js';

@Module({
  controllers: [AiAnalyticsController],
  providers: [AiAnalyticsService],
})
export class AiAnalyticsModule {}
