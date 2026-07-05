import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(recipientType?: string): Promise<{
        id: string;
    }[]>;
    markAsRead(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(): Promise<{
        success: boolean;
        message: string;
    }>;
    markOrderAsReceived(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
