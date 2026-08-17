import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from '../../shared/search/search.service.js';
import { SyncService } from '../../shared/search/sync.service.js';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';

@Controller('admin/search')
export class AdminSearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly syncService: SyncService,
  ) {}

  @Get()
  search(@Query('q') query: string): Promise<unknown> {
    if (!query || query.trim() === '') {
      return Promise.resolve({ results: [], total: 0 });
    }
    return this.searchService.search(query.trim());
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('sync')
  syncProducts(): Promise<unknown> {
    return this.syncService.syncAllProducts();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('analytics')
  getAnalytics(): Promise<unknown> {
    return this.searchService.getSearchAnalytics();
  }
}
