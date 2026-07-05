import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class CountersService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    generateProductCode(): Promise<string>;
}
