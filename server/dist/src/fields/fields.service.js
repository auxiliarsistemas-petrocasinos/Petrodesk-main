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
exports.FieldsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FieldsService = class FieldsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.field.create({ data });
    }
    async findAll() {
        return this.prisma.field.findMany();
    }
    async findOne(id) {
        const field = await this.prisma.field.findUnique({ where: { id } });
        if (!field)
            throw new common_1.NotFoundException('Campo no encontrado');
        return field;
    }
    async update(id, data) {
        return this.prisma.field.update({ where: { id }, data });
    }
    async remove(id) {
        try {
            return await this.prisma.field.delete({ where: { id } });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new common_1.ConflictException('No se puede eliminar un campo con activos, tickets o visitas asociados.');
            }
            throw error;
        }
    }
};
exports.FieldsService = FieldsService;
exports.FieldsService = FieldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FieldsService);
//# sourceMappingURL=fields.service.js.map