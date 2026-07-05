import { ChatService } from './chat.service';
interface ChatRequest {
    message: string;
    history: {
        role: string;
        text: string;
    }[];
}
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(body: ChatRequest): Promise<{
        reply: string;
    }> | {
        reply: string;
    };
}
export {};
