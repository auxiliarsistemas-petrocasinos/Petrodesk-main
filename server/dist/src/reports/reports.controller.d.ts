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
