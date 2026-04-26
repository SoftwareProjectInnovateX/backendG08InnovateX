import { Module } from '@nestjs/common';
import { PrescriptionsController } from './prescriptions.controller.js';
import { PrescriptionsService } from './prescriptions.service.js';
import { FirebaseModule } from '../../shared/firebase/firebase.module.js';

@Module({
  imports: [FirebaseModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
})
export class PrescriptionsModule {}
