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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const now = new Date();
        const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
        const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [ticketsByStatus, criticalTickets, assetsByStatus, loansExpiringSoon, loansOverdue, upcomingVisits, recentVisits, recentActivity,] = await Promise.all([
            this.prisma.ticket.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            this.prisma.ticket.count({
                where: { priority: 'CRITICAL', status: { not: 'CLOSED' } },
            }),
            this.prisma.asset.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
            this.prisma.loan.count({
                where: {
                    status: 'DELIVERED',
                    expectedReturnDate: { lte: in72h, gte: now },
                },
            }),
            this.prisma.loan.count({
                where: {
                    status: 'DELIVERED',
                    expectedReturnDate: { lt: now },
                },
            }),
            this.prisma.visit.count({
                where: {
                    startDate: { gte: now, lte: in7d },
                },
            }),
            this.prisma.visit.count({
                where: {
                    startDate: { gte: ago7d, lte: now },
                },
            }),
            this.prisma.ticketActivity.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, username: true, firstName: true, lastName: true } },
                    ticket: { select: { id: true, title: true } },
                },
            }),
        ]);
        const ticketStatusMap = {
            OPEN: 0,
            IN_PROGRESS: 0,
            CLOSED: 0,
            ESCALATED: 0,
        };
        ticketsByStatus.forEach((t) => {
            ticketStatusMap[t.status] = t._count.id;
        });
        const assetStatusMap = {
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
                total: ticketStatusMap.OPEN +
                    ticketStatusMap.IN_PROGRESS +
                    ticketStatusMap.CLOSED +
                    ticketStatusMap.ESCALATED,
            },
            assets: {
                byStatus: assetStatusMap,
                total: assetStatusMap.AVAILABLE +
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map