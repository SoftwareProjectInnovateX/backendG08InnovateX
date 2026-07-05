import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class ReturnsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    getReturns(): Promise<{
        id: string;
    }[]>;
    submitReturn(body: any): Promise<{
        success: boolean;
        id: string;
    }>;
}
