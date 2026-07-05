import { SearchService } from './search.service.js';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
export declare class SyncService {
    private searchService;
    private firebaseService;
    constructor(searchService: SearchService, firebaseService: FirebaseService);
    syncAllProducts(): Promise<unknown>;
}
