import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class PurchaseOrdersService {
    private readonly firebaseService;
    private db;
    constructor(firebaseService: FirebaseService);
    getOrders(supplierId: string, status?: string): Promise<{
        id: string;
    }[]>;
    getOrderById(orderId: string): Promise<{
        id: string;
    }>;
    approveOrder(orderId: string, supplierId: string, supplierName: string): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
    rejectOrder(orderId: string, supplierId: string, supplierName: string, rejectReason: string): Promise<{
        success: boolean;
        message: string;
        orderId: string;
    }>;
}
