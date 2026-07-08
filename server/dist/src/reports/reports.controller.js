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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async downloadTicketsCsv(res) {
        const csv = await this.reportsService.generateTicketsCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('tickets.csv');
        return res.send(csv);
    }
    async downloadAssetsCsv(res) {
        const csv = await this.reportsService.generateAssetsCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('assets.csv');
        return res.send(csv);
    }
    async downloadLoansCsv(res) {
        const csv = await this.reportsService.generateLoansCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('loans.csv');
        return res.send(csv);
    }
    getTicketsSummary(from, to) {
        return this.reportsService.getTicketsSummary(from, to);
    }
    getAssetsSummary() {
        return this.reportsService.getAssetsSummary();
    }
    getLoansSummary() {
        return this.reportsService.getLoansSummary();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('tickets/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadTicketsCsv", null);
__decorate([
    (0, common_1.Get)('assets/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadAssetsCsv", null);
__decorate([
    (0, common_1.Get)('loans/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadLoansCsv", null);
__decorate([
    (0, common_1.Get)('tickets-summary'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTicketsSummary", null);
__decorate([
    (0, common_1.Get)('assets-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getAssetsSummary", null);
__decorate([
    (0, common_1.Get)('loans-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getLoansSummary", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map