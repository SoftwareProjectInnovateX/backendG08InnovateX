import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { MailService } from '../../shared/mail/mail.service.js';
export declare class AccountRequestsService {
    private readonly firebaseService;
    private readonly mailService;
    constructor(firebaseService: FirebaseService, mailService: MailService);
    getRequests(): Promise<{
        id: string;
    }[]>;
    approveRequest(requestId: string): Promise<{
        success: boolean;
        message: string;
        tempPassword: string;
    }>;
    rejectRequest(requestId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateNextId;
}
