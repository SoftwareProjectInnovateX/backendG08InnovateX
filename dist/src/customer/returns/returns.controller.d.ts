import { ReturnsService } from './returns.service';
export declare class ReturnsController {
    private readonly returnsService;
    constructor(returnsService: ReturnsService);
    getReturns(): Promise<{
        id: string;
    }[]>;
    submitReturn(body: any): Promise<{
        success: boolean;
        id: string;
    }>;
}
