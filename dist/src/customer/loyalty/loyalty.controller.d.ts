import { LoyaltyService, LoyaltyCustomer } from './loyalty.service';
import { AIService } from './ai.service';
export declare class LoyaltyController {
    private readonly loyaltyService;
    private readonly aiService;
    constructor(loyaltyService: LoyaltyService, aiService: AIService);
    getAnalytics(): Promise<{
        totalCustomers: number;
        totalRevenue: number;
        totalPoints: number;
        averageOrderValue: number;
        levelDistribution: {
            Silver: number;
            Gold: number;
            Platinum: number;
        };
    }>;
    getTopCustomers(): Promise<LoyaltyCustomer[]>;
    getCampaignIdeas(): Promise<{
        ideas: string[];
    }>;
    getPersonalizedOffers(uid: string): Promise<{
        offers: string[];
    }>;
    getCustomerProfile(uid: string): Promise<LoyaltyCustomer | null>;
    updateCustomerProfile(uid: string, updates: Partial<LoyaltyCustomer>): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    addPurchase(body: {
        uid: string;
        orderAmount: number;
        orderId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    syncFromOrders(): Promise<{
        success: boolean;
        synced: number;
    } | {
        success: boolean;
        error: string;
    }>;
    consolidateDuplicates(): Promise<{
        success: boolean;
        duplicatesConsolidated: number;
        deletedKeys: string[];
    } | {
        success: boolean;
        error: string;
    }>;
    debugOrders(email: string): Promise<{
        id: string;
        userId: any;
        email: any;
        customerName: any;
        totalAmount: any;
        createdAt: any;
    }[]>;
    debugLoyalty(uid: string): Promise<{
        id: string;
        exists: boolean;
        data: FirebaseFirestore.DocumentData | undefined;
    }>;
}
