import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        tickets: {
            byStatus: Record<string, number>;
            critical: number;
            total: number;
        };
        assets: {
            byStatus: Record<string, number>;
            total: number;
        };
        loans: {
            expiringSoon: number;
            overdue: number;
        };
        visits: {
            upcoming: number;
            recent: number;
        };
        recentActivity: ({
            user: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
            };
            ticket: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            ticketId: string;
            action: string;
            oldValue: string | null;
            newValue: string | null;
        })[];
    }>;
}
