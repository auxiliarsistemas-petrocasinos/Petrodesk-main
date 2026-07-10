import { AssetsService } from './assets.service';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    private requireAdmin;
    create(createAssetDto: any, req: any): Promise<{
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
    }>;
    findAll(status?: string, brand?: string, fieldId?: string, assignedUserId?: string, search?: string, page?: string, pageSize?: string): Promise<{
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
                role: import("@prisma/client").$Enums.Role;
            };
        } & {
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
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getFormOptions(): Promise<{
        brand: string[];
        screenBrand: string[];
    }>;
    getPermissions(req: any): {
        canManage: boolean;
    };
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
            role: import("@prisma/client").$Enums.Role;
        };
        history: ({
            user: {
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
    }>;
    update(id: string, updateAssetDto: any, req: any): Promise<{
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
    }>;
    assign(id: string, body: {
        assignedUserId?: string;
        fieldId?: string;
    }, req: any): Promise<{
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
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    changeStatus(id: string, status: string, req: any): Promise<{
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
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    addHistory(id: string, body: {
        action: string;
        notes?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        notes: string | null;
        assetId: string;
    }>;
}
