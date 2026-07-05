import { SearchService } from '../../shared/search/search.service.js';
import { SyncService } from '../../shared/search/sync.service.js';
export declare class AdminSearchController {
    private readonly searchService;
    private readonly syncService;
    constructor(searchService: SearchService, syncService: SyncService);
    search(query: string): Promise<unknown>;
    syncProducts(): Promise<unknown>;
    getAnalytics(): Promise<unknown>;
}
