import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { CountersService } from '../../shared/counters/counters.service.js';
import { MailService } from '../../shared/mail/mail.service.js';
export declare class AdminProductApprovalService {
    private readonly firebaseService;
    private readonly countersService;
    private readonly mailService;
    constructor(firebaseService: FirebaseService, countersService: CountersService, mailService: MailService);
    getAllPending(): Promise<{
        createdAt: {
            _seconds: any;
        } | null;
        approvedAt: {
            _seconds: any;
        } | null;
        rejectedAt: {
            _seconds: any;
        } | null;
        id: string;
    }[]>;
    approveProduct(pendingProductId: string): Promise<{
        success: boolean;
        productId: string;
        productCode: string;
    }>;
    rejectProduct(pendingProductId: string, reason?: string): Promise<{
        success: boolean;
    }>;
}
