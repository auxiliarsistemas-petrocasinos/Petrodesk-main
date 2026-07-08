import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    downloadTicketsCsv(res: Response): Promise<Response<any, Record<string, any>>>;
    downloadAssetsCsv(res: Response): Promise<Response<any, Record<string, any>>>;
    downloadLoansCsv(res: Response): Promise<Response<any, Record<string, any>>>;
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
