import { PharmacistSystemService } from '../services/pharmacist-system.service.js';
export declare class PharmacistSystemController {
    private readonly systemService;
    constructor(systemService: PharmacistSystemService);
    resetSystemData(): Promise<{
        success: boolean;
        message: string;
    }>;
}
