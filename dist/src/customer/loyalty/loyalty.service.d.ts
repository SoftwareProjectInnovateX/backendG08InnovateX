import { FirebaseService } from '../../shared/firebase/firebase.service';
import { AIService } from './ai.service';
export interface LoyaltyCustomer {
    id: string;
    uid: string;
    name: string;
    email: string;
    phone?: string;
    totalSpent: number;
    totalPoints: number;
    level: 'Silver' | 'Gold' | 'Platinum';
    joinDate: Date;
    lastPurchase: Date;
    purchaseCount: number;
    averageOrderValue: number;
    refillConsistency: number;
    engagementScore: number;
    predictedChurnRisk: number;
    recommendedOffers: string[];
    birthday?: Date;
}
export declare class LoyaltyService {
    private readonly firebaseService;
    private readonly aiService;
    constructor(firebaseService: FirebaseService, aiService: AIService);
    private getDb;
    getCustomerProfile(uid: string): Promise<LoyaltyCustomer | null>;
    private getNameEmailFromOrders;
    getCustomerByEmailAndSync(email: string): Promise<LoyaltyCustomer | null>;
    updateCustomerProfile(uid: string, updates: Partial<LoyaltyCustomer>): Promise<void>;
    calculatePoints(orderAmount: number): Promise<number>;
    addPurchase(uid: string, orderAmount: number, orderId: string): Promise<void>;
    private calculateLevel;
    private buildProfileFromOrders;
    private buildOrdersCustomerMap;
    getTopCustomers(limit?: number): Promise<LoyaltyCustomer[]>;
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
    predictChurnRisk(uid: string): Promise<number>;
    generatePersonalizedOffers(uid: string): Promise<string[]>;
    syncFromOrders(): Promise<{
        success: boolean;
        synced: number;
    }>;
    private cleanupEmailKeyedLoyaltyDocs;
    consolidateDuplicates(): Promise<{
        success: boolean;
        duplicatesConsolidated: number;
        deletedKeys: string[];
    }>;
}
