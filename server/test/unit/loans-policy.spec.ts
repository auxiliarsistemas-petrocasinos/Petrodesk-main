import { Role } from '@prisma/client';
import { assertCanCreateLoanFor, assertCanManageLoanWorkflow, assertCanViewLoan, loanReadScope } from '../../src/loans/loans.policy';

describe('conservative loan policy', () => {
  const admin = { id: 'admin', role: Role.ADMIN };
  const support = { id: 'support', role: Role.IT_SUPPORT };
  const endUser = { id: 'end-user', role: Role.END_USER };

  it('allows support to read and create operational loans', () => {
    expect(loanReadScope(support)).toEqual({});
    expect(() => assertCanCreateLoanFor(support, 'another-user')).not.toThrow();
  });

  it('scopes END_USER reads and creation to ownership', () => {
    expect(loanReadScope(endUser)).toEqual({ OR: [{ userId: endUser.id }, { requestedById: endUser.id }] });
    expect(() => assertCanCreateLoanFor(endUser, 'another-user')).toThrow();
    expect(() => assertCanViewLoan(endUser, { userId: 'other', requestedById: 'other' })).toThrow('Prestamo no encontrado');
  });

  it('allows only ADMIN to execute workflow transitions', () => {
    expect(() => assertCanManageLoanWorkflow(admin)).not.toThrow();
    expect(() => assertCanManageLoanWorkflow(support)).toThrow();
    expect(() => assertCanManageLoanWorkflow(endUser)).toThrow();
  });
});
