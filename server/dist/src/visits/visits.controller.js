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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const visits_service_1 = require("./visits.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const supabase_service_1 = require("../supabase.service");
let VisitsController = class VisitsController {
    constructor(visitsService, supabaseService) {
        this.visitsService = visitsService;
        this.supabaseService = supabaseService;
    }
    create(createVisitDto, req) {
        return this.visitsService.create({
            ...createVisitDto,
            createdById: req.user.id,
        });
    }
    findAll() {
        return this.visitsService.findAll();
    }
    remove(id, req) {
        if (req.user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Solo los administradores pueden eliminar visitas.');
        }
        return this.visitsService.remove(id);
    }
    async uploadReport(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Archivo no proporcionado o formato incorrecto.');
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = (0, path_1.extname)(file.originalname);
        const filename = `report-${id}-${uniqueSuffix}${ext}`;
        const publicUrl = await this.supabaseService.uploadFile('reports', filename, file.buffer, file.mimetype);
        return this.visitsService.updateReportPath(id, publicUrl);
    }
    deleteReport(id) {
        return this.visitsService.deleteReport(id);
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Solo se permiten archivos PDF.'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitsController.prototype, "uploadReport", null);
__decorate([
    (0, common_1.Delete)(':id/report'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "deleteReport", null);
exports.VisitsController = VisitsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visits_service_1.VisitsService,
        supabase_service_1.SupabaseService])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map