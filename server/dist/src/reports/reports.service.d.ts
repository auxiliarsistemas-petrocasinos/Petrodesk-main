import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateTicketsCsv(): Promise<string>;
    generateAssetsCsv(): Promise<string>;
    generateLoansCsv(): Promise<string>;
    getTicketsSummary(from?: string, to?: string): Promise<{
        total: number;
        byStatus: {
            name: import(".prisma/client").$Enums.TicketStatus;
            value: number;
        }[];
        byPriority: {
            name: import(".prisma/client").$Enums.TicketPriority;
            value: number;
        }[];
        byField: {
            name: string;
            count: number;
        }[];
    }>;
    getAssetsSummary(): Promise<{
        total: number;
        byStatus: {
            name: import(".prisma/client").$Enums.AssetStatus;
            value: number;
        }[];
        byBrand: {
            name: string;
            count: number;
        }[];
    }>;
    getLoansSummary(): Promise<{
        total: number;
        byStatus: {
            name: import(".prisma/client").$Enums.LoanStatus;
            value: number;
        }[];
        overdueCount: number;
    }>;
}
