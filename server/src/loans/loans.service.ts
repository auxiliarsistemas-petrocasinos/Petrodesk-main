import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

const userSelect = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  role: true,
};

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, requestedById: string): Promise<Loan> {
    // Check if asset exists and is available
    const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new NotFoundException('Activo no encontrado');
    if (asset.status !== 'AVAILABLE') {
      throw new BadRequestException('El activo no está disponible para préstamo');
    }

    const loan = await this.prisma.loan.create({
      data: {
        asset: { connect: { id: data.assetId } },
        user: { connect: { id: data.userId } },
        requestedBy: { connect: { id: requestedById } },
        expectedReturnDate: new Date(data.expectedReturnDate),
        status: 'REQUESTED',
        notes: data.notes,
      },
      include: { asset: true, user: { select: userSelect }, requestedBy: { select: userSelect } },
    });

    await this.prisma.loanHistory.create({
      data: {
        loanId: loan.id,
        action: 'REQUESTED',
        notes: `Préstamo solicitado por ${loan.requestedBy.username} para el usuario ${loan.user.username}`,
      },
    });

    return loan;
  }

  async findAll(filters: LoanFilters) {
    const where: Prisma.LoanWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.assetId) where.assetId = filters.assetId;
    if (filters.overdue) {
      where.status = 'DELIVERED';
      where.expectedReturnDate = { lt: new Date() };
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    const [data, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: {
          asset: true,
          user: { select: userSelect },
          requestedBy: { select: userSelect },
          approvedBy: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        asset: true,
        user: { select: userSelect },
        requestedBy: { select: userSelect },
        approvedBy: { select: userSelect },
        history: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    return loan;
  }

  async update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan> {
    return this.prisma.loan.update({ where: { id }, data });
  }

  async approve(id: string, approvedById: string): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    if (loan.status !== 'REQUESTED') {
      throw new BadRequestException('El préstamo no está en estado SOLICITADO');
    }

    const updated = await this.prisma.loan.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: { connect: { id: approvedById } },
      },
      include: { asset: true, user: { select: userSelect } },
    });

    await this.prisma.loanHistory.create({
      data: {
        loanId: id,
        action: 'APPROVED',
        notes: `Préstamo aprobado`,
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: loan.userId,
        type: 'LOAN_APPROVED',
        message: `Tu solicitud de préstamo del activo ${updated.asset.internalCode} ha sido aprobada`,
      },
    });

    return updated;
  }

  async reject(id: string, approvedById: string, notes?: string): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    if (loan.status !== 'REQUESTED' && loan.status !== 'APPROVED') {
      throw new BadRequestException('El préstamo no se puede rechazar en este estado');
    }

    const updated = await this.prisma.loan.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: { connect: { id: approvedById } },
        notes: notes || loan.notes,
      },
      include: { asset: true, user: { select: userSelect } },
    });

    await this.prisma.loanHistory.create({
      data: {
        loanId: id,
        action: 'REJECTED',
        notes: notes ? `Préstamo rechazado. Motivo: ${notes}` : 'Préstamo rechazado',
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: loan.userId,
        type: 'LOAN_REJECTED',
        message: `Tu solicitud de préstamo del activo ${updated.asset.internalCode} ha sido rechazada`,
      },
    });

    return updated;
  }

  async deliver(id: string, deliveryNotes?: string): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    if (loan.status !== 'APPROVED') {
      throw new BadRequestException('El préstamo debe estar aprobado antes de entregarse');
    }

    // Update loan and update asset status to IN_USE
    const [updated] = await this.prisma.$transaction([
      this.prisma.loan.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          deliveryDate: new Date(),
        },
        include: { asset: true, user: { select: userSelect } },
      }),
      this.prisma.asset.update({
        where: { id: loan.assetId },
        data: {
          status: 'IN_USE',
          assignedUserId: loan.userId,
        },
      }),
    ]);

    await this.prisma.loanHistory.create({
      data: {
        loanId: id,
        action: 'DELIVERED',
        notes: deliveryNotes ? `Activo entregado. Notas: ${deliveryNotes}` : 'Activo entregado',
      },
    });

    // Asset History
    await this.prisma.assetHistory.create({
      data: {
        assetId: loan.assetId,
        userId: loan.userId,
        action: 'LOAN_DELIVERED',
        notes: `Entregado bajo préstamo ID ${loan.id}`,
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: loan.userId,
        type: 'LOAN_DELIVERED',
        message: `Se te ha entregado el activo ${updated.asset.internalCode}`,
      },
    });

    return updated;
  }

  async return(id: string, condition: string, notes?: string): Promise<Loan> {
    const loan = await this.prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    if (loan.status !== 'DELIVERED') {
      throw new BadRequestException('El préstamo no está en estado ENTREGADO');
    }

    // Update loan status to RETURNED and asset status to AVAILABLE
    const [updated] = await this.prisma.$transaction([
      this.prisma.loan.update({
        where: { id },
        data: {
          status: 'RETURNED',
          actualReturnDate: new Date(),
          returnCondition: condition,
          notes: notes ? `${loan.notes || ''}\nNotas de devolución: ${notes}` : loan.notes,
        },
        include: { asset: true, user: { select: userSelect } },
      }),
      this.prisma.asset.update({
        where: { id: loan.assetId },
        data: {
          status: 'AVAILABLE',
          assignedUserId: null,
        },
      }),
    ]);

    await this.prisma.loanHistory.create({
      data: {
        loanId: id,
        action: 'RETURNED',
        notes: `Activo devuelto. Condición: ${condition}. ${notes ? `Notas: ${notes}` : ''}`,
      },
    });

    // Asset History
    await this.prisma.assetHistory.create({
      data: {
        assetId: loan.assetId,
        userId: loan.userId,
        action: 'LOAN_RETURNED',
        notes: `Devuelto. Condición: ${condition}`,
      },
    });

    return updated;
  }

  async addHistory(loanId: string, action: string, notes?: string) {
    return this.prisma.loanHistory.create({
      data: { loanId, action, notes },
    });
  }
}
