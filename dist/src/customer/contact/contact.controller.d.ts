import { ContactService } from './contact.service';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
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
    replyMessage(id: string, body: {
        reply: string;
    }): Promise<{
        success: boolean;
        id: string;
    }>;
}
