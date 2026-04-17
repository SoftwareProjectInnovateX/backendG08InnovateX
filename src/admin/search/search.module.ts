import { Module } from '@nestjs/common';
import { AdminSearchController } from './search.controller.js';
import { SearchModule } from '../../shared/search/search.module.js';

@Module({
  imports: [SearchModule],
  controllers: [AdminSearchController],
})
export class AdminSearchModule {}
