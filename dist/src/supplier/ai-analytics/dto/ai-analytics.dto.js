"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateSummaryPdfDto = exports.AnalyseInvoicesDto = void 0;
class AnalyseInvoicesDto {
    supplierId;
    invoices;
}
exports.AnalyseInvoicesDto = AnalyseInvoicesDto;
class GenerateSummaryPdfDto {
    supplierId;
    generatedAt;
    invoiceCount;
    supplyRecommendations;
    demandForecast;
    paymentRisk;
    restockSuggestions;
}
exports.GenerateSummaryPdfDto = GenerateSummaryPdfDto;
//# sourceMappingURL=ai-analytics.dto.js.map