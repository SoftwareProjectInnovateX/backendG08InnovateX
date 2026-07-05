import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class BrandsService {
    private readonly firebaseService;
    private cache;
    private readonly TTL;
    constructor(firebaseService: FirebaseService);
    getBrands(): Promise<any[]>;
    addBrand(body: any): Promise<{
        success: boolean;
        id: string;
    }>;
}
