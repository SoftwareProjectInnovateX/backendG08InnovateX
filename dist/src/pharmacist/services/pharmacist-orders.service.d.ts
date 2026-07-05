import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistOrdersService {
    private readonly firebaseService;
    private readonly collectionName;
    private readonly returnsCollection;
    constructor(firebaseService: FirebaseService);
    getOnlineOrders(): Promise<{
        id: string;
    }[]>;
    addOnlineOrder(orderData: any): Promise<any>;
    updateOnlineOrder(id: string, updateData: any): Promise<any>;
    getReturns(): Promise<{
        id: string;
    }[]>;
    updateReturnStatus(id: string, updateData: any): Promise<any>;
}
