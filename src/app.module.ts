import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

// Shared
import { FirebaseModule } from './shared/firebase/firebase.module.js';
import { CountersModule } from './shared/counters/counters.module.js';
import { MailModule } from './shared/mail/mail.module.js';

// Admin
import { UsersModule } from './admin/users/users.module.js';
import { OrdersModule } from './admin/orders/orders.module.js';
import { NotificationsModule } from './admin/notifications/notifications.module.js';
import { AdminSearchModule } from './admin/search/search.module.js';
import { AccountRequestsModule } from './admin/account-requests/account-requests.module.js';
import { AdminProductApprovalModule } from './admin/adminProducts/admin-product-approval.module';

// Supplier
import { SupplierProductsModule } from './supplier/products/supplier-products.module.js';
import { PurchaseOrdersModule } from './supplier/purchase-orders/purchase-orders.module.js';

// Pharmacist
import { PrescriptionsModule } from './pharmacist/prescriptions/prescriptions.module.js';

import { CartModule } from './customer/cart/cart.module.js';
import { CustomerOrdersModule } from './customer/orders/orders.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Serve uploaded prescription images statically
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Shared
    FirebaseModule,
    CountersModule,
    MailModule,

    // Admin
    UsersModule,
    OrdersModule,
    NotificationsModule,
    AdminSearchModule,
    AccountRequestsModule,
    AdminProductApprovalModule,

    // Supplier
    SupplierProductsModule,
    PurchaseOrdersModule,

    // Pharmacist
    PrescriptionsModule,

    // Customer
    CartModule,
    CustomerOrdersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}