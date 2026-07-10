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
exports.FieldsController = void 0;
const common_1 = require("@nestjs/common");
const fields_service_1 = require("./fields.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const client_1 = require("@prisma/client");
let FieldsController = class FieldsController {
    constructor(fieldsService) {
        this.fieldsService = fieldsService;
    }
    requireAdmin(req) {
        if (req.user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Solo los administradores pueden administrar campos.');
        }
    }
    create(createFieldDto, req) {
        this.requireAdmin(req);
        return this.fieldsService.create(createFieldDto);
    }
    findAll() {
        return this.fieldsService.findAll();
    }
    getPermissions(req) {
        return { canManage: req.user?.role === 'ADMIN' };
    }
    findOne(id) {
        return this.fieldsService.findOne(id);
    }
    update(id, updateFieldDto, req) {
        this.requireAdmin(req);
        return this.fieldsService.update(id, updateFieldDto);
    }
    remove(id, req) {
        this.requireAdmin(req);
        return this.fieldsService.remove(id);
    }
};
exports.FieldsController = FieldsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('permissions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FieldsController.prototype, "remove", null);
exports.FieldsController = FieldsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('fields'),
    __metadata("design:paramtypes", [fields_service_1.FieldsService])
], FieldsController);
//# sourceMappingURL=fields.controller.js.map