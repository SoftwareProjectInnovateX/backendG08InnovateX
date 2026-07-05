import { PharmacistInventoryService } from '../services/pharmacist-inventory.service.js';
export declare class PharmacistInventoryController {
    private readonly inventoryService;
    constructor(inventoryService: PharmacistInventoryService);
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
