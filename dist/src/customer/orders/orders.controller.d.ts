import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any, body: any): Promise<{
        success: boolean;
        id: string;
    }>;
    generateHash(orderId: string, amount: string, currency: string): Promise<{
        hash: string;
        merchantId: string;
        actualAmount: string;
    }>;
    confirmPayment(id: string): Promise<{
        success: boolean;
    }>;
    getOrders(req: any): Promise<{
        createdAt: {
            _seconds: any;
            seconds: any;
        } | null;
        id: string;
    }[]>;
    getDeliveredOrders(): Promise<{
        id: string;
    }[]>;
    getProductCode(name: string): Promise<{
        productCode: any;
    }>;
    getOrderDetails(id: string): Promise<{
        id: string;
    } | null>;
    notify(body: any): Promise<{
        received: boolean;
    }>;
    settlePayment(id: string): Promise<{
        success: boolean;
    }>;
}
