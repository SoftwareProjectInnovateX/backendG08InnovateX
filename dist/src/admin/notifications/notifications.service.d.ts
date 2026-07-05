import { FirebaseService } from '../../shared/firebase/firebase.service';
export declare class NotificationsService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    private get db();
    getNotifications(recipientType?: string): Promise<{
        id: string;
    }[]>;
    markAsRead(notificationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(): Promise<{
        success: boolean;
        message: string;
    }>;
    markOrderAsReceived(notificationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(notificationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
