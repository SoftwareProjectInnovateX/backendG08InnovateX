import { PharmacistProfileService } from '../services/pharmacist-profile.service.js';
export declare class PharmacistProfileController {
    private readonly profileService;
    constructor(profileService: PharmacistProfileService);
    getProfile(id: string): Promise<{
        id: string;
    }>;
    updateProfile(id: string, updateData: any): Promise<any>;
}
