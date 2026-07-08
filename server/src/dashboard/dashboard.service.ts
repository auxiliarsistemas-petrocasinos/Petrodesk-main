import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      ticketsByStatus,
      criticalTickets,
      assetsByStatus,
      loansExpiringSoon,
      loansOverdue,
      upcomingVisits,
      recentVisits,
      recentActivity,
    ] = await Promise.all([
      // Tickets by status
      this.prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Critical tickets count
      this.prisma.ticket.count({
        where: { priority: 'CRITICAL', status: { not: 'CLOSED' } },
      }),
      // Assets by status
      this.prisma.asset.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Loans expiring within 72h
      this.prisma.loan.count({
        where: {
          status: 'DELIVERED',
          expectedReturnDate: { lte: in72h, gte: now },
        },
      }),
      // Overdue loans
      this.prisma.loan.count({
        where: {
          status: 'DELIVERED',
          expectedReturnDate: { lt: now },
        },
      }),
      // Upcoming visits (next 7 days)
      this.prisma.visit.count({
        where: {
          startDate: { gte: now, lte: in7d },
        },
      }),
      // Recent visits (last 7 days)
      this.prisma.visit.count({
        where: {
          startDate: { gte: ago7d, lte: now },
        },
      }),
      // Recent activity (last 10 ticket activities)
      this.prisma.ticketActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, firstName: true, lastName: true } },
          ticket: { select: { id: true, title: true } },
        },
      }),
    ]);

    // Format tickets by status
    const ticketStatusMap: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      CLOSED: 0,
      ESCALATED: 0,
    };
    ticketsByStatus.forEach((t) => {
      ticketStatusMap[t.status] = t._count.id;
    });

    // Format assets by status
    const assetStatusMap: Record<string, number> = {
      AVAILABLE: 0,
      IN_USE: 0,
      MAINTENANCE: 0,
      RETIRED: 0,
    };
    assetsByStatus.forEach((a) => {
      assetStatusMap[a.status] = a._count.id;
    });

    return {
      tickets: {
        byStatus: ticketStatusMap,
        critical: criticalTickets,
        total:
          ticketStatusMap.OPEN +
          ticketStatusMap.IN_PROGRESS +
          ticketStatusMap.CLOSED +
          ticketStatusMap.ESCALATED,
      },
      assets: {
        byStatus: assetStatusMap,
        total:
          assetStatusMap.AVAILABLE +
          assetStatusMap.IN_USE +
          assetStatusMap.MAINTENANCE +
          assetStatusMap.RETIRED,
      },
      loans: {
        expiringSoon: loansExpiringSoon,
        overdue: loansOverdue,
      },
      visits: {
        upcoming: upcomingVisits,
        recent: recentVisits,
      },
      recentActivity,
    };
  }
}
