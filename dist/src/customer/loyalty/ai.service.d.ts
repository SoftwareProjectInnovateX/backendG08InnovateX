export declare class AIService {
    private openai;
    constructor();
    generatePersonalizedOffers(customerData: any): Promise<string[]>;
    predictChurnRisk(customerData: any): Promise<number>;
    generateCampaignIdeas(): Promise<string[]>;
}
