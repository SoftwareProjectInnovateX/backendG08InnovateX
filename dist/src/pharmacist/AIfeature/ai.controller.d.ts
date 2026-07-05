import { AiService } from './ai.service';
import { ImageService } from './image.service';
export declare class AiController {
    private readonly aiService;
    private readonly imageService;
    constructor(aiService: AiService, imageService: ImageService);
    describe(body: {
        name: string;
        category?: string;
    }): Promise<{
        description: any;
    }>;
    generateImage(body: {
        name: string;
        category?: string;
    }): Promise<{
        imageUrl: string;
    }>;
}
