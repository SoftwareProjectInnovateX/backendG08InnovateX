import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class ContactService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    sendMessage(body: any): Promise<{
        success: boolean;
        id: string;
    }>;
    getMessagesByEmail(email: string): Promise<{
        id: string;
    }[]>;
    getAllMessages(): Promise<{
        id: string;
    }[]>;
    markAsRead(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    replyMessage(id: string, reply: string): Promise<{
        success: boolean;
        id: string;
    }>;
}
