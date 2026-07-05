import { PharmacistReturnsService } from '../services/pharmacist-returns.service.js';
export declare class PharmacistReturnsController {
    private readonly returnsService;
    constructor(returnsService: PharmacistReturnsService);
    getReturnRequests(): Promise<{
        firebaseId: string;
        id: string;
    }[]>;
    addReturnRequest(returnData: any): Promise<any>;
    approveReturn(id: string, body: {
        adjNote: string;
        items: any[];
    }): Promise<{
        id: string;
        returnStatus: string;
        refundStatus: string;
        restockResults: any[];
    }>;
    rejectReturn(id: string, body: {
        adjNote: string;
    }): Promise<{
        id: string;
        returnStatus: string;
        refundStatus: string;
    }>;
    updateReturnRequest(id: string, updateData: any): Promise<any>;
}
