import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistReturnsService {
    private readonly firebaseService;
    private readonly collectionName;
    private readonly productsCollection;
    constructor(firebaseService: FirebaseService);
    getReturnRequests(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addReturnRequest(returnData: any): Promise<any>;
    updateReturnRequest(id: string, updateData: any): Promise<any>;
    approveReturn(id: string, adjNote: string, items: any[]): Promise<{
        id: string;
        returnStatus: string;
        refundStatus: string;
        restockResults: any[];
    }>;
    rejectReturn(id: string, adjNote: string): Promise<{
        id: string;
        returnStatus: string;
        refundStatus: string;
    }>;
}
