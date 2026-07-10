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
exports.LoansService = void 0;
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
let LoansService = class LoansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, requestedById) {
        if (!data.assetId)
            throw new common_1.BadRequestException('Debe seleccionar un activo');
        if (!data.userId)
            throw new common_1.BadRequestException('Debe seleccionar un solicitante');
        if (!data.expectedReturnDate)
            throw new common_1.BadRequestException('Debe indicar la fecha esperada de devolucion');
        if (!data.notes?.trim())
            throw new common_1.BadRequestException('Debe diligenciar los comentarios');
        const expectedReturnDate = new Date(data.expectedReturnDate);
        if (Number.isNaN(expectedReturnDate.getTime())) {
            throw new common_1.BadRequestException('La fecha esperada de devolucion no es valida');
        }
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (expectedReturnDate < startOfToday) {
            throw new common_1.BadRequestException('La fecha esperada de devolucion no puede estar en el pasado');
        }
        const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Activo no encontrado');
        if (asset.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('El activo no esta disponible para prestamo');
        }
        const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
        if (!user || !user.isActive)
            throw new common_1.NotFoundException('Solicitante no encontrado o inactivo');
        const activeLoan = await this.prisma.loan.findFirst({
            where: {
                assetId: data.assetId,
                status: { in: ['REQUESTED', 'APPROVED', 'DELIVERED'] },
            },
        });
        if (activeLoan)
            throw new common_1.BadRequestException('El activo ya tiene un prestamo abierto');
        const loan = await this.prisma.loan.create({
            data: {
                asset: { connect: { id: data.assetId } },
                user: { connect: { id: data.userId } },
                requestedBy: { connect: { id: requestedById } },
                expectedReturnDate,
                status: 'REQUESTED',
                notes: data.notes?.trim() || null,
            },
            include: { asset: true, user: { select: userSelect }, requestedBy: { select: userSelect } },
        });
        await this.prisma.loanHistory.create({
            data: {
                loanId: loan.id,
                action: 'REQUESTED',
                notes: `Prestamo solicitado por ${loan.requestedBy.username} para el usuario ${loan.user.username}`,
            },
        });
        return loan;
    }
    async findAll(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.assetId)
            where.assetId = filters.assetId;
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
    async findOne(id) {
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
        if (!loan)
            throw new common_1.NotFoundException('Prestamo no encontrado');
        return loan;
    }
    async update(id, data) {
        return this.prisma.loan.update({ where: { id }, data });
    }
    async approve(id, approvedById) {
        const loan = await this.prisma.loan.findUnique({ where: { id }, include: { asset: true } });
        if (!loan)
            throw new common_1.NotFoundException('Prestamo no encontrado');
        if (loan.status !== 'REQUESTED') {
            throw new common_1.BadRequestException('El prestamo no esta en estado SOLICITADO');
        }
        if (loan.asset.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('El activo ya no esta disponible para aprobar este prestamo');
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
                notes: 'Prestamo aprobado',
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: loan.userId,
                type: 'LOAN_APPROVED',
                message: `Tu solicitud de prestamo del activo ${updated.asset.internalCode} ha sido aprobada`,
            },
        });
        return updated;
    }
    async reject(id, approvedById, notes) {
        const loan = await this.prisma.loan.findUnique({ where: { id } });
        if (!loan)
            throw new common_1.NotFoundException('Prestamo no encontrado');
        if (loan.status !== 'REQUESTED' && loan.status !== 'APPROVED') {
            throw new common_1.BadRequestException('El prestamo no se puede rechazar en este estado');
        }
        const cleanNotes = notes?.trim();
        if (!cleanNotes)
            throw new common_1.BadRequestException('Debe diligenciar los comentarios del rechazo');
        const updated = await this.prisma.loan.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy: { connect: { id: approvedById } },
                notes: cleanNotes || loan.notes,
            },
            include: { asset: true, user: { select: userSelect } },
        });
        await this.prisma.loanHistory.create({
            data: {
                loanId: id,
                action: 'REJECTED',
                notes: cleanNotes ? `Prestamo rechazado. Motivo: ${cleanNotes}` : 'Prestamo rechazado',
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: loan.userId,
                type: 'LOAN_REJECTED',
                message: `Tu solicitud de prestamo del activo ${updated.asset.internalCode} ha sido rechazada`,
            },
        });
        return updated;
    }
    async deliver(id, deliveryNotes) {
        const loan = await this.prisma.loan.findUnique({ where: { id }, include: { asset: true } });
        if (!loan)
            throw new common_1.NotFoundException('Prestamo no encontrado');
        if (loan.status !== 'APPROVED') {
            throw new common_1.BadRequestException('El prestamo debe estar aprobado antes de entregarse');
        }
        if (loan.asset.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('El activo ya no esta disponible para entrega');
        }
        const cleanNotes = deliveryNotes?.trim();
        if (!cleanNotes)
            throw new common_1.BadRequestException('Debe diligenciar los comentarios de entrega');
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
                notes: cleanNotes ? `Activo entregado. Notas: ${cleanNotes}` : 'Activo entregado',
            },
        });
        await this.prisma.assetHistory.create({
            data: {
                assetId: loan.assetId,
                userId: loan.userId,
                action: 'LOAN_DELIVERED',
                notes: `Entregado bajo prestamo ID ${loan.id}`,
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: loan.userId,
                type: 'LOAN_DELIVERED',
                message: `Se te ha entregado el activo ${updated.asset.internalCode}`,
            },
        });
        return updated;
    }
    async return(id, condition, notes) {
        const loan = await this.prisma.loan.findUnique({ where: { id } });
        if (!loan)
            throw new common_1.NotFoundException('Prestamo no encontrado');
        if (loan.status !== 'DELIVERED') {
            throw new common_1.BadRequestException('El prestamo no esta en estado ENTREGADO');
        }
        const cleanNotes = notes?.trim();
        if (!cleanNotes)
            throw new common_1.BadRequestException('Debe diligenciar los comentarios de devolucion');
        const [updated] = await this.prisma.$transaction([
            this.prisma.loan.update({
                where: { id },
                data: {
                    status: 'RETURNED',
                    actualReturnDate: new Date(),
                    returnCondition: condition,
                    notes: cleanNotes ? `${loan.notes || ''}\nNotas de devolucion: ${cleanNotes}` : loan.notes,
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
                notes: `Activo devuelto. Condicion: ${condition}. ${cleanNotes ? `Notas: ${cleanNotes}` : ''}`,
            },
        });
        await this.prisma.assetHistory.create({
            data: {
                assetId: loan.assetId,
                userId: loan.userId,
                action: 'LOAN_RETURNED',
                notes: `Devuelto. Condicion: ${condition}`,
            },
        });
        return updated;
    }
    async addHistory(loanId, action, notes) {
        return this.prisma.loanHistory.create({
            data: { loanId, action, notes },
        });
    }
};
exports.LoansService = LoansService;
exports.LoansService = LoansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoansService);
//# sourceMappingURL=loans.service.js.map