import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class VisitsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        expensesDetails: Prisma.JsonValue | null;
    })[]>;
    create(data: any): Promise<{
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
        expensesDetails: Prisma.JsonValue | null;
    }>;
    remove(id: string): Promise<{
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
        expensesDetails: Prisma.JsonValue | null;
    }>;
    updateReportPath(id: string, reportPath: string): Promise<{
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
        expensesDetails: Prisma.JsonValue | null;
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
        expensesDetails: Prisma.JsonValue | null;
    }>;
}
