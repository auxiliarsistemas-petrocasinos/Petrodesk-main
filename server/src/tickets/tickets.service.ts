import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ticket, TicketStatus, TicketPriority, Prisma } from '@prisma/client';

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

const userSelect = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  role: true,
};

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string): Promise<Ticket> {
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

    // Register activity
    await this.prisma.ticketActivity.create({
      data: { ticketId: ticket.id, userId, action: 'CREATED', newValue: ticket.status },
    });

    return ticket;
  }

  async findAll(filters: TicketFilters) {
    const where: Prisma.TicketWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.createdById) where.createdById = filters.createdById;
    if (filters.fieldId) where.fieldId = filters.fieldId;
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

  async findOne(id: string) {
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
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async update(id: string, data: any, userId: string): Promise<Ticket> {
    const current = await this.prisma.ticket.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Ticket no encontrado');

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.fieldId !== undefined) {
      updateData.field = data.fieldId ? { connect: { id: data.fieldId } } : { disconnect: true };
    }
    if (data.assignedToId !== undefined) {
      updateData.assignedTo = data.assignedToId ? { connect: { id: data.assignedToId } } : { disconnect: true };
    }

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: userSelect }, assignedTo: { select: userSelect }, field: true },
    });

    // Record status change activity
    if (data.status && data.status !== current.status) {
      await this.prisma.ticketActivity.create({
        data: { ticketId: id, userId, action: 'STATUS_CHANGED', oldValue: current.status, newValue: data.status },
      });
    }

    // Record priority change activity
    if (data.priority && data.priority !== current.priority) {
      await this.prisma.ticketActivity.create({
        data: { ticketId: id, userId, action: 'PRIORITY_CHANGED', oldValue: current.priority, newValue: data.priority },
      });
    }

    return ticket;
  }

  async remove(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    await this.prisma.$transaction([
      this.prisma.ticketComment.deleteMany({ where: { ticketId: id } }),
      this.prisma.ticketAttachment.deleteMany({ where: { ticketId: id } }),
      this.prisma.ticketActivity.deleteMany({ where: { ticketId: id } }),
      this.prisma.ticket.delete({ where: { id } }),
    ]);

    return { message: `Ticket ${ticket.title} eliminado correctamente` };
  }

  async assign(ticketId: string, assignedToId: string, userId: string) {
    const current = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!current) throw new NotFoundException('Ticket no encontrado');

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedTo: assignedToId ? { connect: { id: assignedToId } } : { disconnect: true } },
      include: { createdBy: { select: userSelect }, assignedTo: { select: userSelect }, field: true },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'ASSIGNED', oldValue: current.assignedToId, newValue: assignedToId },
    });

    // Create notification for the assigned user
    if (assignedToId) {
      await this.prisma.notification.create({
        data: {
          userId: assignedToId,
          type: 'TICKET_ASSIGNED',
          message: `Te han asignado el ticket: ${ticket.title}`,
        },
      });
    }

    return ticket;
  }

  async addComment(ticketId: string, userId: string, comment: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    const created = await this.prisma.ticketComment.create({
      data: { ticketId, userId, comment },
      include: { user: { select: userSelect } },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'COMMENT_ADDED' },
    });

    // Notify ticket creator and assignee (if not the commenter)
    const notifyIds = new Set<string>();
    if (ticket.createdById !== userId) notifyIds.add(ticket.createdById);
    if (ticket.assignedToId && ticket.assignedToId !== userId) notifyIds.add(ticket.assignedToId);

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

  async getComments(ticketId: string) {
    return this.prisma.ticketComment.findMany({
      where: { ticketId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    });
  }
}
