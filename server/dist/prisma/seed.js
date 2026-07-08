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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('Admin1234!', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@petrodesk.com' },
        update: { username: 'admin', firstName: 'Administrador', lastName: 'Sistema' },
        create: {
            email: 'admin@petrodesk.com',
            username: 'admin',
            password,
            role: client_1.Role.ADMIN,
            firstName: 'Administrador',
            lastName: 'Sistema',
        },
    });
    const support1 = await prisma.user.upsert({
        where: { email: 'soporte1@petrodesk.com' },
        update: { username: 'soporte1', firstName: 'Juan', lastName: 'Perez' },
        create: {
            email: 'soporte1@petrodesk.com',
            username: 'soporte1',
            password,
            role: client_1.Role.IT_SUPPORT,
            firstName: 'Juan',
            lastName: 'Perez',
        },
    });
    const support2 = await prisma.user.upsert({
        where: { email: 'soporte2@petrodesk.com' },
        update: { username: 'soporte2', firstName: 'Maria', lastName: 'Rodriguez' },
        create: {
            email: 'soporte2@petrodesk.com',
            username: 'soporte2',
            password,
            role: client_1.Role.IT_SUPPORT,
            firstName: 'Maria',
            lastName: 'Rodriguez',
        },
    });
    const fieldNorte = await prisma.field.upsert({
        where: { id: 'field-norte-id' },
        update: {},
        create: {
            id: 'field-norte-id',
            name: 'Campo Norte',
            location: 'Zona Industrial A',
            supervisorName: 'Ing. Pedro Gomez',
            coordinatorName: 'Laura Velez',
        },
    });
    const fieldSur = await prisma.field.upsert({
        where: { id: 'field-sur-id' },
        update: {},
        create: {
            id: 'field-sur-id',
            name: 'Campo Sur',
            location: 'Sede Operativa B',
            supervisorName: 'Ing. Mario Ruiz',
            coordinatorName: 'Sofia Castro',
        },
    });
    const assetsToCreate = [
        { internalCode: 'PPCEF111', serial: 'SN-12345', brand: 'Dell', model: 'Latitude 5420', status: client_1.AssetStatus.AVAILABLE, fieldId: fieldNorte.id },
        { internalCode: 'PPCEF112', serial: 'SN-67890', brand: 'HP', model: 'EliteBook 840', status: client_1.AssetStatus.AVAILABLE, fieldId: fieldNorte.id },
        { internalCode: 'PPCEF113', serial: 'SN-11223', brand: 'Lenovo', model: 'ThinkPad X1', status: client_1.AssetStatus.MAINTENANCE, fieldId: fieldSur.id },
        { internalCode: 'PPCEF114', serial: 'SN-44556', brand: 'Dell', model: 'OptiPlex 7090', status: client_1.AssetStatus.AVAILABLE, fieldId: fieldSur.id },
        { internalCode: 'PPCEF115', serial: 'SN-77889', brand: 'Apple', model: 'MacBook Pro', status: client_1.AssetStatus.IN_USE, fieldId: fieldNorte.id, assignedUserId: support1.id },
    ];
    for (const asset of assetsToCreate) {
        await prisma.asset.upsert({
            where: { internalCode: asset.internalCode },
            update: { ...asset },
            create: { ...asset },
        });
    }
    console.log('Semillas (Seed Data) limpias generadas exitosamente.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map