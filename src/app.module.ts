import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';  // ← add this
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Shared
import { FirebaseModule } from './shared/firebase/firebase.module.js';
import { CountersModule } from './shared/counters/counters.module.js';

// Admin
import { UsersModule } from './admin/users/users.module.js';
import { OrdersModule } from './admin/orders/orders.module.js';
import { NotificationsModule } from './admin/notifications/notifications.module.js';
import { AdminProductApprovalModule } from './admin/adminProducts/admin-product-approval.module';
// Supplier
import { SupplierProductsModule } from './supplier/products/supplier-products.module.js';
import { PurchaseOrdersModule } from './supplier/purchase-orders/purchase-orders.module.js';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  

    // Shared
    FirebaseModule,
    CountersModule,

    // Admin
    UsersModule,
    OrdersModule,
    NotificationsModule,
    AdminProductApprovalModule,

    // Supplier
    SupplierProductsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}