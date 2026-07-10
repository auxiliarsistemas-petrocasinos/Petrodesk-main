import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAllForUser(req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        message: string;
        readAt: Date | null;
    }[]>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        message: string;
        readAt: Date | null;
    }>;
    markAllAsRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
