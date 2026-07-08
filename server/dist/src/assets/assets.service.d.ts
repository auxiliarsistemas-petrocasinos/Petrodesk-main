import { PrismaService } from '../prisma/prisma.service';
import { Asset, AssetStatus } from '@prisma/client';
interface AssetFilters {
    status?: AssetStatus;
    brand?: string;
    fieldId?: string;
    assignedUserId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
export declare class AssetsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: string): Promise<Asset>;
    findAll(filters: AssetFilters): Promise<{
        data: ({
            field: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                location: string;
                description: string | null;
                supervisorName: string | null;
                supervisorPhone: string | null;
                coordinatorName: string | null;
                coordinatorPhone: string | null;
                hseName: string | null;
                hsePhone: string | null;
            };
            assignedUser: {
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
            internalCode: string;
            serial: string;
            brand: string;
            model: string;
            status: import(".prisma/client").$Enums.AssetStatus;
            assignedUserId: string | null;
            fieldId: string | null;
            imagePath: string | null;
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        field: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string;
            description: string | null;
            supervisorName: string | null;
            supervisorPhone: string | null;
            coordinatorName: string | null;
            coordinatorPhone: string | null;
            hseName: string | null;
            hsePhone: string | null;
        };
        assignedUser: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import(".prisma/client").$Enums.Role;
        };
        history: ({
            user: {
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
            userId: string;
            action: string;
            notes: string | null;
            assetId: string;
        })[];
    } & {
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
    }>;
    update(id: string, data: any, userId: string): Promise<Asset>;
    assign(assetId: string, data: {
        assignedUserId?: string;
        fieldId?: string;
    }, userId: string): Promise<{
        field: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string;
            description: string | null;
            supervisorName: string | null;
            supervisorPhone: string | null;
            coordinatorName: string | null;
            coordinatorPhone: string | null;
            hseName: string | null;
            hsePhone: string | null;
        };
        assignedUser: {
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
        internalCode: string;
        serial: string;
        brand: string;
        model: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        assignedUserId: string | null;
        fieldId: string | null;
        imagePath: string | null;
    }>;
    changeStatus(assetId: string, status: AssetStatus, userId: string): Promise<{
        field: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            location: string;
            description: string | null;
            supervisorName: string | null;
            supervisorPhone: string | null;
            coordinatorName: string | null;
            coordinatorPhone: string | null;
            hseName: string | null;
            hsePhone: string | null;
        };
        assignedUser: {
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
        internalCode: string;
        serial: string;
        brand: string;
        model: string;
        status: import(".prisma/client").$Enums.AssetStatus;
        assignedUserId: string | null;
        fieldId: string | null;
        imagePath: string | null;
    }>;
    addHistory(assetId: string, userId: string, action: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        notes: string | null;
        assetId: string;
    }>;
}
export {};
