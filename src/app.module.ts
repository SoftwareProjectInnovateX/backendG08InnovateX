import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
<<<<<<< HEAD
import { ChatModule } from './admin/chat/chat.module.js';
=======
import { AdminProductApprovalModule } from './admin/adminProducts/admin-product-approval.module';
>>>>>>> f597565319a22a51de2f9a5c154532518d708af4

// Supplier
import { SupplierProductsModule } from './supplier/products/supplier-products.module.js';
import { PurchaseOrdersModule } from './supplier/purchase-orders/purchase-orders.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

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
<<<<<<< HEAD
    ChatModule,
=======
    AdminProductApprovalModule,
>>>>>>> f597565319a22a51de2f9a5c154532518d708af4

    // Supplier
    SupplierProductsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}