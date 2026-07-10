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
exports.AssetsService = void 0;
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
const assetFormFields = [
    'equipmentType',
    'operatingSystem',
    'ram',
    'ssdStorage',
    'hddStorage',
    'screenSize',
    'antivirus',
];
let AssetsService = class AssetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureAssetFormColumns();
    }
    async ensureAssetFormColumns() {
        await this.prisma.$executeRawUnsafe(`
      ALTER TABLE "Asset"
      ADD COLUMN IF NOT EXISTS "equipmentType" TEXT,
      ADD COLUMN IF NOT EXISTS "operatingSystem" TEXT,
      ADD COLUMN IF NOT EXISTS "processor" TEXT,
      ADD COLUMN IF NOT EXISTS "ram" TEXT,
      ADD COLUMN IF NOT EXISTS "ssdStorage" TEXT,
      ADD COLUMN IF NOT EXISTS "hddStorage" TEXT,
      ADD COLUMN IF NOT EXISTS "screenCode" TEXT,
      ADD COLUMN IF NOT EXISTS "screenBrand" TEXT,
      ADD COLUMN IF NOT EXISTS "screenSerial" TEXT,
      ADD COLUMN IF NOT EXISTS "screenSize" TEXT,
      ADD COLUMN IF NOT EXISTS "antivirus" TEXT,
      ADD COLUMN IF NOT EXISTS "observations" TEXT;
    `);
    }
    optional(value) {
        return typeof value === 'string' && value.trim() === '' ? null : value;
    }
    async create(data, userId) {
        const internalCode = data.internalCode || `ACT-${Date.now()}`;
        const assetData = {
            internalCode,
            serial: data.serial,
            brand: data.brand,
            model: data.model,
            equipmentType: this.optional(data.equipmentType),
            operatingSystem: this.optional(data.operatingSystem),
            processor: this.optional(data.processor),
            ram: this.optional(data.ram),
            ssdStorage: this.optional(data.ssdStorage),
            hddStorage: this.optional(data.hddStorage),
            screenCode: this.optional(data.screenCode),
            screenBrand: this.optional(data.screenBrand),
            screenSerial: this.optional(data.screenSerial),
            screenSize: this.optional(data.screenSize),
            antivirus: this.optional(data.antivirus),
            observations: this.optional(data.observations),
            status: data.status || 'AVAILABLE',
            imagePath: data.imagePath,
        };
        if (data.assignedUserId)
            assetData.assignedUser = { connect: { id: data.assignedUserId } };
        if (data.fieldId)
            assetData.field = { connect: { id: data.fieldId } };
        const asset = await this.prisma.asset.create({
            data: assetData,
            include: { assignedUser: { select: userSelect }, field: true },
        });
        await this.prisma.assetHistory.create({
            data: { assetId: asset.id, userId, action: 'CREATED', notes: `Activo creado: ${asset.internalCode}` },
        });
        return asset;
    }
    async findAll(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.brand)
            where.brand = { contains: filters.brand, mode: 'insensitive' };
        if (filters.fieldId)
            where.fieldId = filters.fieldId;
        if (filters.assignedUserId)
            where.assignedUserId = filters.assignedUserId;
        if (filters.search) {
            where.OR = [
                { internalCode: { contains: filters.search, mode: 'insensitive' } },
                { serial: { contains: filters.search, mode: 'insensitive' } },
                { brand: { contains: filters.search, mode: 'insensitive' } },
                { model: { contains: filters.search, mode: 'insensitive' } },
                { equipmentType: { contains: filters.search, mode: 'insensitive' } },
                { operatingSystem: { contains: filters.search, mode: 'insensitive' } },
                { screenCode: { contains: filters.search, mode: 'insensitive' } },
                { screenSerial: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const [data, total] = await Promise.all([
            this.prisma.asset.findMany({
                where,
                include: {
                    assignedUser: { select: userSelect },
                    field: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.asset.count({ where }),
        ]);
        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }
    async findOne(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            include: {
                assignedUser: { select: userSelect },
                field: true,
                history: {
                    include: { user: { select: userSelect } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!asset)
            throw new common_1.NotFoundException('Activo no encontrado');
        return asset;
    }
    async getFormOptions() {
        const assets = await this.prisma.asset.findMany({
            select: {
                brand: true,
                screenBrand: true,
                equipmentType: true,
                operatingSystem: true,
                ram: true,
                ssdStorage: true,
                hddStorage: true,
                screenSize: true,
                antivirus: true,
            },
        });
        const unique = (values) => [...new Set(values.filter((value) => Boolean(value?.trim())).map((value) => value.trim()))].sort((a, b) => a.localeCompare(b));
        return {
            brand: unique(assets.map((asset) => asset.brand)),
            screenBrand: unique(assets.map((asset) => asset.screenBrand)),
            ...assetFormFields.reduce((acc, field) => {
                acc[field] = unique(assets.map((asset) => asset[field]));
                return acc;
            }, {}),
        };
    }
    async update(id, data, userId) {
        const current = await this.prisma.asset.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException('Activo no encontrado');
        const updateData = {};
        if (data.internalCode)
            updateData.internalCode = data.internalCode;
        if (data.serial)
            updateData.serial = data.serial;
        if (data.brand)
            updateData.brand = data.brand;
        if (data.model)
            updateData.model = data.model;
        assetFormFields.forEach((field) => {
            if (data[field] !== undefined)
                updateData[field] = data[field] || null;
        });
        ['processor', 'screenCode', 'screenBrand', 'screenSerial', 'observations'].forEach((field) => {
            if (data[field] !== undefined)
                updateData[field] = data[field] || null;
        });
        if (data.imagePath !== undefined)
            updateData.imagePath = data.imagePath;
        if (data.status)
            updateData.status = data.status;
        if (data.fieldId !== undefined) {
            updateData.field = data.fieldId ? { connect: { id: data.fieldId } } : { disconnect: true };
        }
        if (data.assignedUserId !== undefined) {
            updateData.assignedUser = data.assignedUserId
                ? { connect: { id: data.assignedUserId } }
                : { disconnect: true };
        }
        const asset = await this.prisma.asset.update({
            where: { id },
            data: updateData,
            include: { assignedUser: { select: userSelect }, field: true },
        });
        if (data.status && data.status !== current.status) {
            await this.prisma.assetHistory.create({
                data: { assetId: id, userId, action: 'STATUS_CHANGED', notes: `${current.status} → ${data.status}` },
            });
        }
        return asset;
    }
    async remove(id) {
        const asset = await this.prisma.asset.findUnique({
            where: { id },
            select: { id: true, internalCode: true, _count: { select: { loans: true } } },
        });
        if (!asset)
            throw new common_1.NotFoundException('Activo no encontrado');
        if (asset._count.loans > 0) {
            throw new common_1.ConflictException('No se puede eliminar un activo con prestamos asociados.');
        }
        await this.prisma.$transaction([
            this.prisma.assetHistory.deleteMany({ where: { assetId: id } }),
            this.prisma.asset.delete({ where: { id } }),
        ]);
        return { message: `Activo ${asset.internalCode} eliminado correctamente` };
    }
    async assign(assetId, data, userId) {
        const current = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!current)
            throw new common_1.NotFoundException('Activo no encontrado');
        const updateData = {};
        if (data.assignedUserId !== undefined) {
            updateData.assignedUser = data.assignedUserId
                ? { connect: { id: data.assignedUserId } }
                : { disconnect: true };
        }
        if (data.fieldId !== undefined) {
            updateData.field = data.fieldId ? { connect: { id: data.fieldId } } : { disconnect: true };
        }
        const asset = await this.prisma.asset.update({
            where: { id: assetId },
            data: updateData,
            include: { assignedUser: { select: userSelect }, field: true },
        });
        await this.prisma.assetHistory.create({
            data: {
                assetId,
                userId,
                action: 'ASSIGNED',
                notes: data.assignedUserId
                    ? `Asignado a usuario ${data.assignedUserId}`
                    : data.fieldId
                        ? `Asignado a campo ${data.fieldId}`
                        : 'Desasignado',
            },
        });
        return asset;
    }
    async changeStatus(assetId, status, userId) {
        const current = await this.prisma.asset.findUnique({ where: { id: assetId } });
        if (!current)
            throw new common_1.NotFoundException('Activo no encontrado');
        const asset = await this.prisma.asset.update({
            where: { id: assetId },
            data: { status },
            include: { assignedUser: { select: userSelect }, field: true },
        });
        await this.prisma.assetHistory.create({
            data: { assetId, userId, action: 'STATUS_CHANGED', notes: `${current.status} → ${status}` },
        });
        return asset;
    }
    async addHistory(assetId, userId, action, notes) {
        return this.prisma.assetHistory.create({
            data: { assetId, userId, action, notes },
        });
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map