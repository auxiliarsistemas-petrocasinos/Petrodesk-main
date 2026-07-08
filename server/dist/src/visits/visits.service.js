"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path_1 = require("path");
let VisitsService = class VisitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.visit.findMany({
            include: {
                field: { select: { name: true } },
                createdBy: { select: { username: true, firstName: true, lastName: true } },
            },
            orderBy: { startDate: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.visit.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                expensesTotal: parseFloat(data.expensesTotal || '0'),
            },
            include: {
                field: { select: { name: true } },
                createdBy: { select: { username: true, firstName: true, lastName: true } },
            },
        });
    }
    async remove(id) {
        return this.prisma.visit.delete({
            where: { id },
        });
    }
    async updateReportPath(id, reportPath) {
        const visit = await this.prisma.visit.findUnique({
            where: { id },
            select: { reportPath: true },
        });
        if (visit?.reportPath) {
            const relativePath = visit.reportPath.startsWith('/') ? visit.reportPath.slice(1) : visit.reportPath;
            const oldFilePath = (0, path_1.join)(__dirname, '..', '..', relativePath);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                }
                catch (err) {
                    console.error(`Error deleting old report file: ${oldFilePath}`, err);
                }
            }
        }
        return this.prisma.visit.update({
            where: { id },
            data: { reportPath },
            include: {
                field: { select: { name: true } },
                createdBy: { select: { username: true, firstName: true, lastName: true } },
            },
        });
    }
    async deleteReport(id) {
        const visit = await this.prisma.visit.findUnique({
            where: { id },
            select: { reportPath: true },
        });
        if (visit?.reportPath) {
            const relativePath = visit.reportPath.startsWith('/') ? visit.reportPath.slice(1) : visit.reportPath;
            const filePath = (0, path_1.join)(__dirname, '..', '..', relativePath);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                }
                catch (err) {
                    console.error(`Error deleting report file: ${filePath}`, err);
                }
            }
        }
        return this.prisma.visit.update({
            where: { id },
            data: { reportPath: null },
            include: {
                field: { select: { name: true } },
                createdBy: { select: { username: true, firstName: true, lastName: true } },
            },
        });
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map