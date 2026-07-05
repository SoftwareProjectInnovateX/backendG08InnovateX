import { FirebaseService } from '../../shared/firebase/firebase.service';
import { ProductsService } from '../products/products.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MailService } from '../../shared/mail/mail.service';
export declare class OrdersService {
    private readonly firebaseService;
    private readonly productsService;
    private readonly loyaltyService;
    private readonly mailService;
    constructor(firebaseService: FirebaseService, productsService: ProductsService, loyaltyService: LoyaltyService, mailService: MailService);
    generateHash(orderId: string, amount: string, currency: string): Promise<{
        hash: string;
        merchantId: string;
        actualAmount: string;
    }>;
    private normalizeOrderItems;
    createOrder(body: any, user: {
        uid: string;
        email?: string;
    }): Promise<{
        success: boolean;
        id: string;
    }>;
    getOrders(userId?: string, email?: string): Promise<{
        createdAt: {
            _seconds: any;
            seconds: any;
        } | null;
        id: string;
    }[]>;
    getDeliveredOrders(): Promise<{
        id: string;
    }[]>;
    getProductCodeByName(name: string): Promise<{
        productCode: any;
    }>;
    getOrderDetails(orderId: string): Promise<{
        id: string;
    } | null>;
    handleNotify(body: any): Promise<{
        received: boolean;
    }>;
    confirmPaymentLocally(orderId: string): Promise<{
        success: boolean;
    }>;
    settlePayment(customerOrderId: string): Promise<{
        success: boolean;
    }>;
}
