import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications?recipientType=admin
  @Get()
  getNotifications(@Query('recipientType') recipientType: string = 'admin') {
    return this.notificationsService.getNotifications(recipientType);
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // PATCH /notifications/read-all
  @Patch('read-all')
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  // PATCH /notifications/:id/mark-received
  @Patch(':id/mark-received')
  markOrderAsReceived(@Param('id') id: string) {
    return this.notificationsService.markOrderAsReceived(id);
  }

  // DELETE /notifications/:id
  @Delete(':id')
  deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}