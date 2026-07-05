import { ForecastService } from './forecast.service';
export declare class ForecastScheduler {
    private readonly forecastService;
    private readonly logger;
    constructor(forecastService: ForecastService);
    generateDailyForecast(): Promise<void>;
}
