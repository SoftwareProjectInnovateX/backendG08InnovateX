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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const ai_analytics_service_js_1 = require("./ai-analytics.service.js");
const ai_analytics_dto_js_1 = require("./dto/ai-analytics.dto.js");
let AiAnalyticsController = class AiAnalyticsController {
    aiAnalyticsService;
    constructor(aiAnalyticsService) {
        this.aiAnalyticsService = aiAnalyticsService;
    }
    supplyRecommendations(dto) {
        return this.aiAnalyticsService.supplyRecommendations(dto);
    }
    demandForecast(dto) {
        return this.aiAnalyticsService.demandForecast(dto);
    }
    paymentRisk(dto) {
        return this.aiAnalyticsService.paymentRisk(dto);
    }
    restockSuggestions(dto) {
        return this.aiAnalyticsService.restockSuggestions(dto);
    }
    async generateSummaryPdf(dto, res) {
        const pdfBuffer = await this.aiAnalyticsService.generateSummaryPdf(dto);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="AI-Analytics-Summary-${new Date(dto.generatedAt).toISOString().split('T')[0]}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
};
exports.AiAnalyticsController = AiAnalyticsController;
__decorate([
    (0, common_1.Post)('supply-recommendations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analytics_dto_js_1.AnalyseInvoicesDto]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "supplyRecommendations", null);
__decorate([
    (0, common_1.Post)('demand-forecast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analytics_dto_js_1.AnalyseInvoicesDto]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "demandForecast", null);
__decorate([
    (0, common_1.Post)('payment-risk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analytics_dto_js_1.AnalyseInvoicesDto]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "paymentRisk", null);
__decorate([
    (0, common_1.Post)('restock-suggestions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analytics_dto_js_1.AnalyseInvoicesDto]),
    __metadata("design:returntype", void 0)
], AiAnalyticsController.prototype, "restockSuggestions", null);
__decorate([
    (0, common_1.Post)('generate-summary-pdf'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_analytics_dto_js_1.GenerateSummaryPdfDto, Object]),
    __metadata("design:returntype", Promise)
], AiAnalyticsController.prototype, "generateSummaryPdf", null);
exports.AiAnalyticsController = AiAnalyticsController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_analytics_service_js_1.AiAnalyticsService])
], AiAnalyticsController);
//# sourceMappingURL=ai-analytics.controller.js.map