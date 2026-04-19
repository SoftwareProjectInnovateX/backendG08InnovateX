import { Module } from '@nestjs/common';
import { AdminProductApprovalController } from './admin-product-approval.controller.js';
import { AdminProductApprovalService } from './admin-product-approval.service.js';
import { FirebaseModule } from '../../shared/firebase/firebase.module.js';
import { CountersModule } from '../../shared/counters/counters.module.js';

@Module({
  imports: [
    FirebaseModule,
    CountersModule,
  ],
  controllers: [AdminProductApprovalController],
  providers: [AdminProductApprovalService],
  exports: [AdminProductApprovalService],
})
export class AdminProductApprovalModule {}