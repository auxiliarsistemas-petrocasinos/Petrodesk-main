"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const userSelect = {
    id: true,
    email: true,
    username: true,
    firstName: true,
    lastName: true,
    role: true,
};
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        const ticket = await this.prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                priority: data.priority || 'LOW',
                status: data.status || 'OPEN',
                createdBy: { connect: { id: userId } },
                ...(data.assignedToId && { assignedTo: { connect: { id: data.assignedToId } } }),
                ...(data.fieldId && { field: { connect: { id: data.fieldId } } }),
            },
            include: { createdBy: { select: userSelect }, assignedTo: { select: userSelect }, field: true },
        });
        await this.prisma.ticketActivity.create({
            data: { ticketId: ticket.id, userId, action: 'CREATED', newValue: ticket.status },
        });
        return ticket;
    }
    async findAll(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.priority)
            where.priority = filters.priority;
        if (filters.assignedToId)
            where.assignedToId = filters.assignedToId;
        if (filters.createdById)
            where.createdById = filters.createdById;
        if (filters.fieldId)
            where.fieldId = filters.fieldId;
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const [data, total] = await Promise.all([
            this.prisma.ticket.findMany({
                where,
                include: {
                    createdBy: { select: userSelect },
                    assignedTo: { select: userSelect },
                    field: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.ticket.count({ where }),
        ]);
        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async findOne(id) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: {
                createdBy: { select: userSelect },
                assignedTo: { select: userSelect },
                field: true,
                comments: {
                    include: { user: { select: userSelect } },
                    orderBy: { createdAt: 'asc' },
                },
                attachments: true,
                activities: {
                    include: { user: { select: userSelect } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return ticket;
    }
    async update(id, data, userId) {
        const current = await this.prisma.ticket.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException('Ticket no encontrado');
        const updateData = {};
        if (data.title)
            updateData.title = data.title;
        if (data.description)
            updateData.description = data.description;
        if (data.status)
            updateData.status = data.status;
        if (data.priority)
            updateData.priority = data.priority;
        if (data.fieldId !== undefined) {
            updateData.field = data.fieldId ? { connect: { id: data.fieldId } } : { disconnect: true };
        }
        const ticket = await this.prisma.ticket.update({
            where: { id },
            data: updateData,
            include: { createdBy: { select: userSelect }, assignedTo: { select: userSelect }, field: true },
        });
        if (data.status && data.status !== current.status) {
            await this.prisma.ticketActivity.create({
                data: { ticketId: id, userId, action: 'STATUS_CHANGED', oldValue: current.status, newValue: data.status },
            });
        }
        if (data.priority && data.priority !== current.priority) {
            await this.prisma.ticketActivity.create({
                data: { ticketId: id, userId, action: 'PRIORITY_CHANGED', oldValue: current.priority, newValue: data.priority },
            });
        }
        return ticket;
    }
    async assign(ticketId, assignedToId, userId) {
        const current = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!current)
            throw new common_1.NotFoundException('Ticket no encontrado');
        const ticket = await this.prisma.ticket.update({
            where: { id: ticketId },
            data: { assignedTo: { connect: { id: assignedToId } } },
            include: { createdBy: { select: userSelect }, assignedTo: { select: userSelect }, field: true },
        });
        await this.prisma.ticketActivity.create({
            data: { ticketId, userId, action: 'ASSIGNED', oldValue: current.assignedToId, newValue: assignedToId },
        });
        await this.prisma.notification.create({
            data: {
                userId: assignedToId,
                type: 'TICKET_ASSIGNED',
                message: `Te han asignado el ticket: ${ticket.title}`,
            },
        });
        return ticket;
    }
    async addComment(ticketId, userId, comment) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        const created = await this.prisma.ticketComment.create({
            data: { ticketId, userId, comment },
            include: { user: { select: userSelect } },
        });
        await this.prisma.ticketActivity.create({
            data: { ticketId, userId, action: 'COMMENT_ADDED' },
        });
        const notifyIds = new Set();
        if (ticket.createdById !== userId)
            notifyIds.add(ticket.createdById);
        if (ticket.assignedToId && ticket.assignedToId !== userId)
            notifyIds.add(ticket.assignedToId);
        for (const nId of notifyIds) {
            await this.prisma.notification.create({
                data: {
                    userId: nId,
                    type: 'TICKET_COMMENT',
                    message: `Nuevo comentario en el ticket: ${ticket.title}`,
                },
            });
        }
        return created;
    }
    async getComments(ticketId) {
        return this.prisma.ticketComment.findMany({
            where: { ticketId },
            include: { user: { select: userSelect } },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map