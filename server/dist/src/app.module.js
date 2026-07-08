"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const tickets_module_1 = require("./tickets/tickets.module");
const assets_module_1 = require("./assets/assets.module");
const fields_module_1 = require("./fields/fields.module");
const loans_module_1 = require("./loans/loans.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
const visits_module_1 = require("./visits/visits.module");
const supabase_module_1 = require("./supabase.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, users_module_1.UsersModule, tickets_module_1.TicketsModule, assets_module_1.AssetsModule, fields_module_1.FieldsModule, loans_module_1.LoansModule, notifications_module_1.NotificationsModule, reports_module_1.ReportsModule, visits_module_1.VisitsModule, supabase_module_1.SupabaseModule, dashboard_module_1.DashboardModule],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map