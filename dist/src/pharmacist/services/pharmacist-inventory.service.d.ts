import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistInventoryService {
    private readonly firebaseService;
    private readonly collectionName;
    constructor(firebaseService: FirebaseService);
    getInventory(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addInventoryItem(itemData: any): Promise<any>;
    updateInventoryItem(id: string, updateData: any): Promise<any>;
    deleteInventoryItem(id: string): Promise<{
        id: string;
    }>;
}
