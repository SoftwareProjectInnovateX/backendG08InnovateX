import { OrdersService } from './orders.service.js';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getAll(): Promise<{
        id: string;
    }[]>;
    getOne(id: string): Promise<{
        id: string;
    }>;
    create(orderData: any): Promise<any>;
}
