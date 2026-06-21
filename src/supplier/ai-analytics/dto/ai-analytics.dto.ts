export interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceRecord {
  id: string;
  productName: string;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  invoiceType: 'INITIAL' | 'FINAL';
  invoiceDate: string;
  dueDate: string;
  paidDate: string | null;
  items: InvoiceItem[];
  pharmacy: string;
  orderId: string;
}

export class AnalyseInvoicesDto {
  supplierId!: string;
  invoices!: InvoiceRecord[];
}

/* ── Added for POST /ai/generate-summary-pdf ── */

export interface SupplyRecommendation {
  productName: string;
  urgency: string;
  reason: string;
  invoiceCount: number;
  totalValue: number;
  avgOrderValue: number;
  paymentRate: number;
  confidence: number;
}

export interface DemandForecastItem {
  productName: string;
  avgMonthlyOrders: number;
  trend: string;
  predictedValue: number;
  growthRate: number;
  confidence: number;
}

export interface PaymentRiskItem {
  invoiceNumber: string;
  productName: string;
  riskLevel: string;
  reason: string;
  amount: number;
  dueDate: string;
  daysOverdue: number | null;
  riskScore: number;
}

export interface RestockSuggestion {
  productName: string;
  recentOrders: number;
  avgInvoiceValue: number;
  restock: boolean;
  suggestedOrderValue: number;
  reasoning: string;
  confidence: number;
}

export class GenerateSummaryPdfDto {
  supplierId!: string;
  generatedAt!: string;
  invoiceCount!: number;
  supplyRecommendations!: SupplyRecommendation[];
  demandForecast!: DemandForecastItem[];
  paymentRisk!: PaymentRiskItem[];
  restockSuggestions!: RestockSuggestion[];
}