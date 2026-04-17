import { Module } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { SyncService } from './sync.service.js';
import { FirebaseModule } from '../firebase/firebase.module.js';

@Module({
  imports: [FirebaseModule],
  providers: [SearchService, SyncService],
  exports: [SearchService, SyncService], // ← exported so role modules can inject them
})
export class SearchModule {}
