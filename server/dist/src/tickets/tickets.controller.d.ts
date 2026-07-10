import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    private requireAdmin;
    create(createTicketDto: any, req: any): Promise<{
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
    findAll(status?: string, priority?: string, assignedToId?: string, createdById?: string, fieldId?: string, search?: string, page?: string, pageSize?: string): Promise<{
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
    update(id: string, updateTicketDto: any, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    assign(id: string, assignedToId: string, req: any): Promise<{
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
    addComment(id: string, comment: string, req: any): Promise<{
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
    getComments(id: string): Promise<({
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
