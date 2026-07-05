export declare class ChatService {
    private groq;
    constructor();
    private readonly prescriptionDrugs;
    private readonly systemPrompt;
    chat(message: string, history: {
        role: string;
        text: string;
    }[]): Promise<{
        reply: string;
    }>;
}
