interface PrescriptionBody {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    userId?: string;
}
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export declare class PrescriptionController {
    uploadPrescription(file: MulterFile, body: PrescriptionBody): Promise<{
        success: boolean;
        message: string;
        prescription: {
            id: string;
            fileName: string;
            fileSize: number;
            mimeType: string;
            imageUrl: string;
            status: string;
            customerName: string;
            customerPhone: string;
            customerAddress: string;
            userId: string | null;
            createdAt: string;
        };
    }>;
}
export {};
