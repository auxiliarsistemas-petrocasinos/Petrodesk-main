"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const usersToDelete = ['usuario1', 'usuario2', 'usuario3'];
    console.log('Iniciando limpieza de datos de ejemplo...');
    for (const username of usersToDelete) {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                createdTickets: true,
                assignedTickets: true,
                requestedLoans: true,
                loans: true,
            }
        });
        if (user) {
            console.log(`Limpiando datos de: ${username}...`);
            await prisma.ticketComment.deleteMany({
                where: { userId: user.id }
            });
            await prisma.loan.deleteMany({
                where: {
                    OR: [
                        { requestedById: user.id },
                        { userId: user.id },
                        { approvedById: user.id }
                    ]
                }
            });
            await prisma.ticket.deleteMany({
                where: {
                    OR: [
                        { createdById: user.id },
                        { assignedToId: user.id }
                    ]
                }
            });
            await prisma.user.delete({
                where: { id: user.id }
            });
            console.log(`✅ ${username} y todos sus datos relacionados han sido eliminados.`);
        }
        else {
            console.log(`ℹ️ El usuario ${username} no existe o ya fue eliminado.`);
        }
    }
    console.log('Limpieza completada con éxito.');
}
main()
    .catch((e) => {
    console.error('Error durante la limpieza:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=cleanup.js.map