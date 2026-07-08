import { FieldsService } from './fields.service';
import { Prisma } from '@prisma/client';
export declare class FieldsController {
    private readonly fieldsService;
    constructor(fieldsService: FieldsService);
    create(createFieldDto: Prisma.FieldCreateInput): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, updateFieldDto: Prisma.FieldUpdateInput): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
