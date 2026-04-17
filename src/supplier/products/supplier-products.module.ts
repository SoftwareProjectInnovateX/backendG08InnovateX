import { Module } from '@nestjs/common';
import { SupplierProductsController } from './supplier-products.controller';
import { SupplierProductsService } from './supplier-products.service';
import { FirebaseModule } from '../../shared/firebase/firebase.module';
import { CountersModule } from '../../shared/counters/counters.module';

@Module({
  imports: [
    FirebaseModule,
    CountersModule, // needed for generateProductCode()
  ],
  controllers: [SupplierProductsController],
  providers: [SupplierProductsService],
})
export class SupplierProductsModule {}
