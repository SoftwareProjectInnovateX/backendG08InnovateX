import { PrescriptionsService } from './prescriptions.service';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    upload(file: Express.Multer.File, customerName: string, customerPhone: string, customerAddress: string, userId: string): Promise<{
        prescription: {
            id: string;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
            imageUrl: string;
            status: string;
        };
    }>;
    getAll(): Promise<{
        id: string;
    }[]>;
    update(id: string, updateData: any): Promise<{
        success: boolean;
    }>;
}
