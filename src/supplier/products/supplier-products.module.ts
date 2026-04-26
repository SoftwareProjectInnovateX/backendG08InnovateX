import { Module } from '@nestjs/common';
import { SupplierProductsController } from './supplier-products.controller';
import { SupplierProductsService } from './supplier-products.service';
import { FirebaseModule } from '../../shared/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [SupplierProductsController],
  providers: [SupplierProductsService],
})
export class SupplierProductsModule {}