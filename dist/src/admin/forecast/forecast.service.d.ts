import { FirebaseService } from '../../shared/firebase/firebase.service';
export interface ForecastResult {
    productId: string;
    productName: string;
    productCode: string;
    category: string;
    stock: number;
    minStock: number;
    supplierName: string;
    totalSold: number;
    dailyAvg: number;
    forecast7d: number;
    forecast30d: number;
    risk: 'High' | 'Medium' | 'Low';
    daysUntilStockout: number | null;
    dailySales: number[];
    isExpired: boolean;
}
export declare class ForecastService {
    private readonly firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    getForecast(): Promise<ForecastResult[]>;
    saveForecastSnapshot(): Promise<void>;
    private fetchCompletedOrders;
    private fetchProducts;
    private aggregateSalesByProductId;
    private predictDemand;
    private calculateStockRisk;
    private generateFallbackInsight;
    getAiInsight(productId: string): Promise<{
        insight: string;
    }>;
}
