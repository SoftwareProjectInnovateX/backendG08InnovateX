import { ForecastService } from './forecast.service.js';
export declare class ForecastController {
    private readonly forecastService;
    constructor(forecastService: ForecastService);
    getForecast(): Promise<import("./forecast.service.js").ForecastResult[]>;
    getInsight(productId: string): Promise<{
        insight: string;
    }>;
}
