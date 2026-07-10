import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Loan, Prisma, Role } from '@prisma/client';

export interface LoanActor { id: string; role: Role }

export function loanReadScope(actor: LoanActor): Prisma.LoanWhereInput {
  return actor.role === Role.END_USER ? { OR: [{ userId: actor.id }, { requestedById: actor.id }] } : {};
}

export function assertCanCreateLoanFor(actor: LoanActor, beneficiaryId: string): void {
  if (actor.role === Role.END_USER && beneficiaryId !== actor.id) throw new ForbiddenException();
}

export function assertCanViewLoan(actor: LoanActor, loan: Pick<Loan, 'userId' | 'requestedById'>): void {
  if (actor.role === Role.END_USER && loan.userId !== actor.id && loan.requestedById !== actor.id) {
    throw new NotFoundException('Prestamo no encontrado');
  }
}

export function assertCanManageLoanWorkflow(actor: LoanActor): void {
  if (actor.role !== Role.ADMIN) throw new ForbiddenException('Solo administradores pueden ejecutar esta transicion');
}

export function loanCapabilities(actor: LoanActor) {
  return {
    canCreateForOthers: actor.role === Role.ADMIN || actor.role === Role.IT_SUPPORT,
    canManageWorkflow: actor.role === Role.ADMIN,
    canEdit: actor.role === Role.ADMIN,
    canDelete: actor.role === Role.ADMIN,
  };
}
