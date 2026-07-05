import { PharmacistOrdersService } from '../services/pharmacist-orders.service.js';
export declare class PharmacistOrdersController {
    private readonly ordersService;
    constructor(ordersService: PharmacistOrdersService);
    getReturns(): Promise<{
        id: string;
    }[]>;
    updateReturnStatus(id: string, updateData: any): Promise<any>;
    getOnlineOrders(): Promise<{
        id: string;
    }[]>;
    addOnlineOrder(orderData: any): Promise<any>;
    updateOnlineOrder(id: string, updateData: any): Promise<any>;
}
