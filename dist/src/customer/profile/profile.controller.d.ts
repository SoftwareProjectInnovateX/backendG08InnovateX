import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(uid: string): Promise<{
        loyaltyPoints: number;
        totalPoints: number;
        level: string;
        recommendedOffers: never[];
        id: string;
    } | {
        loyaltyPoints: any;
        totalPoints: any;
        level: "Silver" | "Gold" | "Platinum";
        recommendedOffers: never[];
        id: string;
    } | {
        loyaltyPoints: number;
        totalPoints: number;
        level: string;
        recommendedOffers: never[];
        id: string;
        fullName: any;
        email: any;
        phone: any;
        role: string;
        status: string;
    } | {
        loyaltyPoints: any;
        totalPoints: any;
        level: "Silver" | "Gold" | "Platinum";
        recommendedOffers: never[];
        id: string;
        fullName: any;
        email: any;
        phone: any;
        role: string;
        status: string;
    }>;
    updateProfile(uid: string, body: any): Promise<{
        success: boolean;
        uid: string;
    }>;
}
