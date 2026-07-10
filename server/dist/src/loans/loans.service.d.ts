import { PrismaService } from '../prisma/prisma.service';
import { Loan, LoanStatus, Prisma } from '@prisma/client';
interface LoanFilters {
    status?: LoanStatus;
    userId?: string;
    assetId?: string;
    overdue?: boolean;
    page?: number;
    pageSize?: number;
}
export declare class LoansService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, requestedById: string): Promise<Loan>;
    findAll(filters: LoanFilters): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
            };
            asset: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                internalCode: string;
                serial: string;
                brand: string;
                model: string;
                equipmentType: string | null;
                operatingSystem: string | null;
                processor: string | null;
                ram: string | null;
                ssdStorage: string | null;
                hddStorage: string | null;
                screenCode: string | null;
                screenBrand: string | null;
                screenSerial: string | null;
                screenSize: string | null;
                antivirus: string | null;
                observations: string | null;
                status: import("@prisma/client").$Enums.AssetStatus;
                assignedUserId: string | null;
                fieldId: string | null;
                imagePath: string | null;
            };
            approvedBy: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
            };
            requestedBy: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            approvedById: string | null;
            userId: string;
            requestedById: string;
            status: import("@prisma/client").$Enums.LoanStatus;
            notes: string | null;
            assetId: string;
            deliveryDate: Date | null;
            expectedReturnDate: Date;
            actualReturnDate: Date | null;
            returnCondition: string | null;
            confirmationText: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Loan>;
    update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan>;
    approve(id: string, approvedById: string): Promise<Loan>;
    reject(id: string, approvedById: string, notes?: string): Promise<Loan>;
    deliver(id: string, deliveryNotes?: string): Promise<Loan>;
    return(id: string, condition: string, notes?: string): Promise<Loan>;
    addHistory(loanId: string, action: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        notes: string | null;
        loanId: string;
    }>;
}
export {};
