import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class UsersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getAllUsers(): Promise<any[]>;
    getUserById(id: string): Promise<{
        id: string;
    }>;
    addLoyaltyPoints(id: string, points: number): Promise<{
        success: boolean;
        loyaltyPoints: any;
    }>;
    updateStatus(id: string, status: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
