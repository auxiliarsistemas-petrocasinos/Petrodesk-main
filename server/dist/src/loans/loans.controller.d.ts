import { LoansService } from './loans.service';
export declare class LoansController {
    private readonly loansService;
    constructor(loansService: LoansService);
    create(createLoanDto: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    findAll(status?: string, userId?: string, assetId?: string, overdue?: string, page?: string, pageSize?: string): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
            };
            asset: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                internalCode: string;
                serial: string;
                brand: string;
                model: string;
                status: import(".prisma/client").$Enums.AssetStatus;
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
                role: import(".prisma/client").$Enums.Role;
            };
            requestedBy: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            approvedById: string | null;
            userId: string;
            requestedById: string;
            status: import(".prisma/client").$Enums.LoanStatus;
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
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    update(id: string, updateLoanDto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    approve(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    reject(id: string, notes: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    deliver(id: string, notes: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    return(id: string, condition: string, notes: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        approvedById: string | null;
        userId: string;
        requestedById: string;
        status: import(".prisma/client").$Enums.LoanStatus;
        notes: string | null;
        assetId: string;
        deliveryDate: Date | null;
        expectedReturnDate: Date;
        actualReturnDate: Date | null;
        returnCondition: string | null;
        confirmationText: string | null;
    }>;
    addHistory(id: string, body: {
        action: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        notes: string | null;
        loanId: string;
    }>;
}
