import { PrismaService } from '../prisma/prisma.service';
import { Field, Prisma } from '@prisma/client';
export declare class FieldsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.FieldCreateInput): Promise<Field>;
    findAll(): Promise<Field[]>;
    findOne(id: string): Promise<Field>;
    update(id: string, data: Prisma.FieldUpdateInput): Promise<Field>;
    remove(id: string): Promise<Field>;
}
