import { PharmacistDispensedService } from '../services/pharmacist-dispensed.service.js';
export declare class PharmacistDispensedController {
    private readonly dispensedService;
    constructor(dispensedService: PharmacistDispensedService);
    getDispensedHistory(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addDispensedRecord(req: any, dispenseData: any): Promise<any>;
    settlePayment(id: string): Promise<any>;
    updateDispensedRecord(id: string, updateData: any): Promise<any>;
}
