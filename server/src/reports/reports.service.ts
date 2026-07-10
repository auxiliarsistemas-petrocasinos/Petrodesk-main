import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Parser } from 'json2csv';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private countMap(groups: Array<Record<string, unknown> & { _count: { id: number } }>, key: string) {
    return groups.reduce<Record<string, number>>((acc, group) => {
      const name = String(group[key]);
      acc[name] = group._count.id;
      return acc;
    }, {});
  }

  async generateTicketsCsv(): Promise<string> {
    const tickets = await this.prisma.ticket.findMany({
      include: { createdBy: true, assignedTo: true, field: true }
    });
    const formatted = tickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      createdBy: t.createdBy?.email || '',
      assignedTo: t.assignedTo?.email || 'N/A',
      field: t.field?.name || 'N/A',
      createdAt: t.createdAt,
    }));
    const fields = ['id', 'title', 'description', 'status', 'priority', 'createdBy', 'assignedTo', 'field', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(formatted);
  }

  async generateAssetsCsv(): Promise<string> {
    const assets = await this.prisma.asset.findMany({
      include: { assignedUser: true, field: true }
    });
    const formatted = assets.map(a => ({
      id: a.id,
      internalCode: a.internalCode,
      serial: a.serial,
      brand: a.brand,
      model: a.model,
      status: a.status,
      assignedUser: a.assignedUser?.email || 'N/A',
      field: a.field?.name || 'N/A',
      createdAt: a.createdAt,
    }));
    const fields = ['id', 'internalCode', 'serial', 'brand', 'model', 'status', 'assignedUser', 'field', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(formatted);
  }

  async generateLoansCsv(): Promise<string> {
    const loans = await this.prisma.loan.findMany({
      include: { asset: true, user: true, requestedBy: true, approvedBy: true }
    });
    const formatted = loans.map(l => ({
      id: l.id,
      assetCode: l.asset?.internalCode || '',
      assetName: `${l.asset?.brand || ''} ${l.asset?.model || ''}`,
      user: l.user?.email || '',
      requestedBy: l.requestedBy?.email || '',
      approvedBy: l.approvedBy?.email || 'N/A',
      status: l.status,
      deliveryDate: l.deliveryDate || 'N/A',
      expectedReturnDate: l.expectedReturnDate,
      actualReturnDate: l.actualReturnDate || 'N/A',
      returnCondition: l.returnCondition || 'N/A',
      createdAt: l.createdAt,
    }));
    const fields = ['id', 'assetCode', 'assetName', 'user', 'requestedBy', 'approvedBy', 'status', 'deliveryDate', 'expectedReturnDate', 'actualReturnDate', 'returnCondition', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(formatted);
  }

  async getTicketsSummary(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [statusGroups, priorityGroups, fieldGroups, total] = await Promise.all([
      this.prisma.ticket.groupBy({
        where,
        by: ['status'],
        _count: { id: true }
      }),
      this.prisma.ticket.groupBy({
        where,
        by: ['priority'],
        _count: { id: true }
      }),
      this.prisma.ticket.groupBy({
        where,
        by: ['fieldId'],
        _count: { id: true }
      }),
      this.prisma.ticket.count({ where })
    ]);

    // Resolve field names for field groups
    const resolvedFieldGroups = await Promise.all(
      fieldGroups.map(async fg => {
        if (!fg.fieldId) return { name: 'Sin Campo', count: fg._count.id };
        const field = await this.prisma.field.findUnique({ where: { id: fg.fieldId } });
        return { name: field?.name || 'N/A', count: fg._count.id };
      })
    );

    return {
      total,
      byStatus: this.countMap(statusGroups, 'status'),
      byPriority: this.countMap(priorityGroups, 'priority'),
      byField: resolvedFieldGroups,
    };
  }

  async getAssetsSummary() {
    const [statusGroups, brandGroups, total] = await Promise.all([
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      this.prisma.asset.groupBy({
        by: ['brand'],
        _count: { id: true }
      }),
      this.prisma.asset.count()
    ]);

    return {
      total,
      byStatus: this.countMap(statusGroups, 'status'),
      byBrand: brandGroups.map(bg => ({ name: bg.brand, count: bg._count.id })),
    };
  }

  async getLoansSummary() {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const [statusGroups, overdue, expiringSoon, total] = await Promise.all([
      this.prisma.loan.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      this.prisma.loan.count({
        where: {
          status: 'DELIVERED',
          expectedReturnDate: { lt: now }
        }
      }),
      this.prisma.loan.count({
        where: {
          status: 'DELIVERED',
          expectedReturnDate: { gte: now, lte: in72h }
        }
      }),
      this.prisma.loan.count()
    ]);

    return {
      total,
      byStatus: this.countMap(statusGroups, 'status'),
      overdue,
      expiringSoon,
    };
  }
}
