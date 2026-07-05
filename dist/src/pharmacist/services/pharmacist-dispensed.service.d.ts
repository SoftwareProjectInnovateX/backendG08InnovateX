import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { LoyaltyService } from '../../customer/loyalty/loyalty.service.js';
export declare class PharmacistDispensedService {
    private readonly firebaseService;
    private readonly loyaltyService;
    private readonly collectionName;
    constructor(firebaseService: FirebaseService, loyaltyService: LoyaltyService);
    getDispensedHistory(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addDispensedRecord(dispenseData: any): Promise<any>;
    updateDispensedRecord(id: string, updateData: any): Promise<any>;
}
