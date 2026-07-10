import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketStatus, TicketPriority } from '@prisma/client';
interface TicketFilters {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: string;
    createdById?: string;
    fieldId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any, userId: string): Promise<Ticket>;
    findAll(filters: TicketFilters): Promise<{
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
            assignedTo: {
                id: string;
                email: string;
                username: string;
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
            };
            createdBy: {
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
            assignedToId: string | null;
            createdById: string;
            description: string;
            status: import("@prisma/client").$Enums.TicketStatus;
            fieldId: string | null;
            title: string;
            priority: import("@prisma/client").$Enums.TicketPriority;
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
        assignedTo: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
        };
        comments: ({
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
            updatedAt: Date;
            userId: string;
            comment: string;
            ticketId: string;
        })[];
        attachments: {
            id: string;
            createdAt: Date;
            ticketId: string;
            filePath: string;
            fileName: string;
            fileType: string;
            size: number;
        }[];
        activities: ({
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
            ticketId: string;
            action: string;
            oldValue: string | null;
            newValue: string | null;
        })[];
        createdBy: {
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
        assignedToId: string | null;
        createdById: string;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        fieldId: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
    }>;
    update(id: string, data: any, userId: string): Promise<Ticket>;
    remove(id: string): Promise<{
        message: string;
    }>;
    assign(ticketId: string, assignedToId: string, userId: string): Promise<{
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
        assignedTo: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
        };
        createdBy: {
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
        assignedToId: string | null;
        createdById: string;
        description: string;
        status: import("@prisma/client").$Enums.TicketStatus;
        fieldId: string | null;
        title: string;
        priority: import("@prisma/client").$Enums.TicketPriority;
    }>;
    addComment(ticketId: string, userId: string, comment: string): Promise<{
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
        updatedAt: Date;
        userId: string;
        comment: string;
        ticketId: string;
    }>;
    getComments(ticketId: string): Promise<({
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
        updatedAt: Date;
        userId: string;
        comment: string;
        ticketId: string;
    })[]>;
}
export {};
