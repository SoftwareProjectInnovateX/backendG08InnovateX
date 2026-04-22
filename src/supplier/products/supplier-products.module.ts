import { Module } from '@nestjs/common';
import { SupplierProductsController } from './supplier-products.controller';
import { SupplierProductsService } from './supplier-products.service';
import { FirebaseModule } from '../../shared/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],   // CountersModule removed — product codes are assigned by admin on approval
  controllers: [SupplierProductsController],
  providers: [SupplierProductsService],
})
export class SupplierProductsModule {}