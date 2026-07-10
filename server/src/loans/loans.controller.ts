import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { LoanStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanActor, assertCanManageLoanWorkflow, loanCapabilities } from './loans.policy';
import { LoansService } from './loans.service';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}
  @Post() create(@Body() dto: any, @Request() req: { user: LoanActor }) { return this.loansService.create(dto, req.user); }
  @Get() findAll(@Request() req: { user: LoanActor }, @Query('status') status?: string, @Query('userId') userId?: string, @Query('assetId') assetId?: string, @Query('overdue') overdue?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.loansService.findAll({ status: status as LoanStatus, userId, assetId, overdue: overdue === 'true', page: page ? parseInt(page) : undefined, pageSize: pageSize ? parseInt(pageSize) : undefined }, req.user);
  }
  @Get('permissions') permissions(@Request() req: { user: LoanActor }) { return loanCapabilities(req.user); }
  @Get(':id') findOne(@Param('id') id: string, @Request() req: { user: LoanActor }) { return this.loansService.findOne(id, req.user); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.remove(id); }
  @Post(':id/approve') approve(@Param('id') id: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.approve(id, req.user.id); }
  @Post(':id/reject') reject(@Param('id') id: string, @Body('notes') notes: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.reject(id, req.user.id, notes); }
  @Post(':id/deliver') deliver(@Param('id') id: string, @Body('notes') notes: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.deliver(id, notes); }
  @Post(':id/return') returnLoan(@Param('id') id: string, @Body('condition') condition: string, @Body('notes') notes: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.return(id, condition, notes); }
  @Post(':id/history') addHistory(@Param('id') id: string, @Body() body: { action: string; notes?: string }, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.addHistory(id, body.action, body.notes); }
}
