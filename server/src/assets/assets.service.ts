import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Asset, AssetStatus, Prisma } from '@prisma/client';

interface AssetFilters {
  status?: AssetStatus;
  brand?: string;
  fieldId?: string;
  assignedUserId?: string;
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

const assetFormFields = [
  'equipmentType',
  'operatingSystem',
  'ram',
  'ssdStorage',
  'hddStorage',
  'screenSize',
  'antivirus',
] as const;

@Injectable()
export class AssetsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureAssetFormColumns();
  }

  private async ensureAssetFormColumns() {
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

  private optional(value: unknown) {
    return typeof value === 'string' && value.trim() === '' ? null : value;
  }

  async create(data: any, userId: string): Promise<Asset> {
    const internalCode = data.internalCode || `ACT-${Date.now()}`;
    const assetData: any = {
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
    if (data.assignedUserId) assetData.assignedUser = { connect: { id: data.assignedUserId } };
    if (data.fieldId) assetData.field = { connect: { id: data.fieldId } };

    const asset = await this.prisma.asset.create({
      data: assetData,
      include: { assignedUser: { select: userSelect }, field: true },
    });

    await this.prisma.assetHistory.create({
      data: { assetId: asset.id, userId, action: 'CREATED', notes: `Activo creado: ${asset.internalCode}` },
    });

    return asset;
  }

  async findAll(filters: AssetFilters) {
    const where: Prisma.AssetWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.fieldId) where.fieldId = filters.fieldId;
    if (filters.assignedUserId) where.assignedUserId = filters.assignedUserId;
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

  async findOne(id: string) {
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
    if (!asset) throw new NotFoundException('Activo no encontrado');
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
      } as any,
    });

    const unique = (values: Array<string | null | undefined>) =>
      [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))].sort((a, b) =>
        a.localeCompare(b),
      );

    return {
      brand: unique(assets.map((asset: any) => asset.brand)),
      screenBrand: unique(assets.map((asset: any) => asset.screenBrand)),
      ...assetFormFields.reduce((acc, field) => {
        acc[field] = unique(assets.map((asset: any) => asset[field]));
        return acc;
      }, {} as Record<string, string[]>),
    };
  }

  async update(id: string, data: any, userId: string): Promise<Asset> {
    const current = await this.prisma.asset.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Activo no encontrado');

    const updateData: any = {};
    if (data.internalCode) updateData.internalCode = data.internalCode;
    if (data.serial) updateData.serial = data.serial;
    if (data.brand) updateData.brand = data.brand;
    if (data.model) updateData.model = data.model;
    assetFormFields.forEach((field) => {
      if (data[field] !== undefined) updateData[field] = data[field] || null;
    });
    ['processor', 'screenCode', 'screenBrand', 'screenSerial', 'observations'].forEach((field) => {
      if (data[field] !== undefined) updateData[field] = data[field] || null;
    });
    if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
    if (data.status) updateData.status = data.status;
    if (data.fieldId !== undefined) {
      updateData.field = data.fieldId ? { connect: { id: data.fieldId } } : { disconnect: true };
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

  async assign(assetId: string, data: { assignedUserId?: string; fieldId?: string }, userId: string) {
    const current = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!current) throw new NotFoundException('Activo no encontrado');

    const updateData: any = {};
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

  async changeStatus(assetId: string, status: AssetStatus, userId: string) {
    const current = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!current) throw new NotFoundException('Activo no encontrado');

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

  async addHistory(assetId: string, userId: string, action: string, notes?: string) {
    return this.prisma.assetHistory.create({
      data: { assetId, userId, action, notes },
    });
  }
}
