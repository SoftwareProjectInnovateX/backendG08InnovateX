import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistProfileService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getProfile(pharmacistId: string): Promise<{
        id: string;
    }>;
    updateProfile(pharmacistId: string, updateData: any): Promise<any>;
}
