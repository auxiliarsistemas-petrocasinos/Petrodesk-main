import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.NotificationCreateInput): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        message: string;
        readAt: Date | null;
    }>;
    createForUser(userId: string, type: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        message: string;
        readAt: Date | null;
    }>;
    findAllForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        message: string;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<{
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
    markAllAsRead(userId: string): Promise<Prisma.BatchPayload>;
}
