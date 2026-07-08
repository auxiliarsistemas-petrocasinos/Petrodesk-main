import { VisitsService } from './visits.service';
import { SupabaseService } from '../supabase.service';
export declare class VisitsController {
    private readonly visitsService;
    private readonly supabaseService;
    constructor(visitsService: VisitsService, supabaseService: SupabaseService);
    create(createVisitDto: any, req: any): Promise<{
        field: {
            name: string;
        };
        createdBy: {
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        description: string | null;
        fieldId: string;
        startDate: Date;
        endDate: Date;
        reportPath: string | null;
        expensesTotal: number;
        expensesDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(): Promise<({
        field: {
            name: string;
        };
        createdBy: {
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        description: string | null;
        fieldId: string;
        startDate: Date;
        endDate: Date;
        reportPath: string | null;
        expensesTotal: number;
        expensesDetails: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        description: string | null;
        fieldId: string;
        startDate: Date;
        endDate: Date;
        reportPath: string | null;
        expensesTotal: number;
        expensesDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    uploadReport(id: string, file: Express.Multer.File): Promise<{
        field: {
            name: string;
        };
        createdBy: {
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        description: string | null;
        fieldId: string;
        startDate: Date;
        endDate: Date;
        reportPath: string | null;
        expensesTotal: number;
        expensesDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteReport(id: string): Promise<{
        field: {
            name: string;
        };
        createdBy: {
            username: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        description: string | null;
        fieldId: string;
        startDate: Date;
        endDate: Date;
        reportPath: string | null;
        expensesTotal: number;
        expensesDetails: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
