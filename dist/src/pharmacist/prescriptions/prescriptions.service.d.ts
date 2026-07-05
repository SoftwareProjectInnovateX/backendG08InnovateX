export declare class PrescriptionsService {
    constructor();
    private transporter;
    private get db();
    private uploadToCloudinary;
    uploadPrescription(file: Express.Multer.File, customerName: string, customerPhone: string, customerAddress: string, userId?: string): Promise<{
        prescription: {
            id: string;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
            imageUrl: string;
            status: string;
        };
    }>;
    getAllPrescriptions(): Promise<{
        id: string;
    }[]>;
    updatePrescription(id: string, updateData: any): Promise<{
        success: boolean;
    }>;
}
