import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class PharmacistSystemService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    resetSystemData(): Promise<{
        success: boolean;
        message: string;
    }>;
}
