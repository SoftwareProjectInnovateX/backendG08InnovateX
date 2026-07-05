import { MailerService } from '@nestjs-modules/mailer';
interface ApprovalEmailData {
    to: string;
    name: string;
    role: 'supplier' | 'pharmacist';
    tempPassword: string;
}
interface RejectionEmailData {
    to: string;
    name: string;
    role: 'supplier' | 'pharmacist';
}
export declare class MailService {
    private readonly mailer;
    constructor(mailer: MailerService);
    sendApprovalEmail(data: ApprovalEmailData): Promise<void>;
    sendRejectionEmail(data: RejectionEmailData): Promise<void>;
    sendProductApprovedEmail(data: {
        to: string;
        supplierName: string;
        productName: string;
        productCode: string;
    }): Promise<void>;
    sendProductRejectedEmail(data: {
        to: string;
        supplierName: string;
        productName: string;
        reason?: string;
    }): Promise<void>;
    sendInvoiceEmail(data: {
        to: string;
        customerName: string;
        orderId: string;
        address: string;
        phone: string;
        totalAmount: string | number;
        items?: any[];
    }): Promise<void>;
}
export {};
