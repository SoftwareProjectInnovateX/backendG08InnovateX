import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ForecastService } from './forecast.service';

@Injectable()
export class ForecastScheduler {
  private readonly logger = new Logger(ForecastScheduler.name);

  constructor(private readonly forecastService: ForecastService) {}

  /**
   * Runs every day at 02:00 AM server time.
   * Writes results to the salesForecasts Firestore collection.
   *
   * To test immediately without waiting for 2 AM, temporarily change to:
   * @Cron(CronExpression.EVERY_MINUTE)
   */
  @Cron('0 2 * * *')
  async generateDailyForecast() {
    this.logger.log('Starting daily forecast generation…');
    try {
      await this.forecastService.saveForecastSnapshot();
      this.logger.log('Daily forecast complete.');
    } catch (err) {
      this.logger.error('Daily forecast failed', err);
    }
  }
}