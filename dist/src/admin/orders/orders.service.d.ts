import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class OrdersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getAllOrders(): Promise<{
        id: string;
    }[]>;
    getOrderById(id: string): Promise<{
        id: string;
    }>;
    createOrder(orderPayload: any): Promise<any>;
}
