import { Module } from '@nestjs/common';
import { CustomerPrescriptionsController } from './customer-prescriptions.controller';
import { FirebaseModule } from '../../shared/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [CustomerPrescriptionsController],
})
export class CustomerPrescriptionsModule {}
