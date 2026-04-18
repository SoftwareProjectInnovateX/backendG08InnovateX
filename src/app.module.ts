import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Shared
import { FirebaseModule } from './shared/firebase/firebase.module.js';
import { CountersModule } from './shared/counters/counters.module.js';

// Admin
import { UsersModule } from './admin/users/users.module.js';
import { OrdersModule } from './admin/orders/orders.module.js';
import { NotificationsModule } from './admin/notifications/notifications.module.js';
import { AdminSearchModule } from './admin/search/search.module.js';

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
    AdminSearchModule,

    // Supplier
    SupplierProductsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
