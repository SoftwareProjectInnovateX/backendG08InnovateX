import { AnalyseInvoicesDto, GenerateSummaryPdfDto } from './dto/ai-analytics.dto.js';
export declare class AiAnalyticsService {
    supplyRecommendations(dto: AnalyseInvoicesDto): {
        recommendations: {
            productName: string;
            urgency: string;
            reason: string;
            invoiceCount: number;
            totalValue: number;
            avgOrderValue: number;
            paymentRate: number;
            confidence: number;
        }[];
    };
    demandForecast(dto: AnalyseInvoicesDto): {
        forecasts: {
            productName: string;
            avgMonthlyOrders: number;
            trend: string;
            predictedValue: number;
            growthRate: number;
            confidence: number;
            monthlyHistory: {
                month: string;
                value: number;
            }[];
        }[];
    };
    paymentRisk(dto: AnalyseInvoicesDto): {
        risks: {
            invoiceNumber: string;
            productName: string;
            pharmacy: string;
            amount: number;
            dueDate: string;
            daysOverdue: number | null;
            riskScore: number;
            riskLevel: string;
            reason: string;
        }[];
    };
    restockSuggestions(dto: AnalyseInvoicesDto): {
        suggestions: {
            productName: string;
            recentOrders: number;
            avgInvoiceValue: number;
            restock: boolean;
            suggestedOrderValue: number;
            reasoning: string;
            confidence: number;
        }[];
    };
    generateSummaryPdf(dto: GenerateSummaryPdfDto): Promise<Buffer>;
    private buildSummaryPdf;
    private pdfHeader;
    private pdfOverview;
    private pdfSupplySection;
    private pdfDemandSection;
    private pdfRiskSection;
    private pdfRestockSection;
    private pdfSectionTitle;
    private pdfEmptyState;
    private pdfTableHeader;
    private pdfTableRow;
    private pdfHr;
    private pdfEnsureSpace;
    private pdfFooterOnAllPages;
}
