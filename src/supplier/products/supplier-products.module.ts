import { Module } from '@nestjs/common';
import { SupplierProductsController } from './supplier-products.controller';
import { SupplierProductsService } from './supplier-products.service';
import { FirebaseModule } from '../../shared/firebase/firebase.module';
import { CountersModule } from '../../shared/counters/counters.module';
import { SearchModule } from '../../shared/search/search.module';
@Module({
  imports: [FirebaseModule, CountersModule, SearchModule],
  controllers: [SupplierProductsController],
  providers: [SupplierProductsService],
})
export class SupplierProductsModule {}
