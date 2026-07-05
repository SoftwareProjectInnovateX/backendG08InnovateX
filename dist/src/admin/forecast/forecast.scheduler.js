"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ForecastScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const forecast_service_1 = require("./forecast.service");
let ForecastScheduler = ForecastScheduler_1 = class ForecastScheduler {
    forecastService;
    logger = new common_1.Logger(ForecastScheduler_1.name);
    constructor(forecastService) {
        this.forecastService = forecastService;
    }
    async generateDailyForecast() {
        this.logger.log('Starting daily forecast generation…');
        try {
            await this.forecastService.saveForecastSnapshot();
            this.logger.log('Daily forecast complete.');
        }
        catch (err) {
            this.logger.error('Daily forecast failed', err);
        }
    }
};
exports.ForecastScheduler = ForecastScheduler;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ForecastScheduler.prototype, "generateDailyForecast", null);
exports.ForecastScheduler = ForecastScheduler = ForecastScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [forecast_service_1.ForecastService])
], ForecastScheduler);
//# sourceMappingURL=forecast.scheduler.js.map