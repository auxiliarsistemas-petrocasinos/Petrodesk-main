import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    private countMap;
    generateTicketsCsv(): Promise<string>;
    generateAssetsCsv(): Promise<string>;
    generateLoansCsv(): Promise<string>;
    getTicketsSummary(from?: string, to?: string): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        byField: {
            name: string;
            count: number;
        }[];
    }>;
    getAssetsSummary(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byBrand: {
            name: string;
            count: number;
        }[];
    }>;
    getLoansSummary(): Promise<{
        total: number;
        byStatus: Record<string, number>;
        overdue: number;
        expiringSoon: number;
    }>;
}
