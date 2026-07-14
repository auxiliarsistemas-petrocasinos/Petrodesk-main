import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanActor, assertCanManageLoanWorkflow, loanCapabilities } from './loans.policy';
import { LoansService } from './loans.service';
import { CreateLoanDto, LoanHistoryDto, LoanNotesDto, LoanQueryDto, ReturnLoanDto, UpdateLoanDto } from './loans.dto';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}
  @Post() create(@Body() dto: CreateLoanDto, @Request() req: { user: LoanActor }) { return this.loansService.create(dto, req.user); }
  @Get() findAll(@Request() req: { user: LoanActor }, @Query() query: LoanQueryDto) {
    return this.loansService.findAll({ ...query, overdue: query.overdue === 'true' }, req.user);
  }
  @Get('permissions') permissions(@Request() req: { user: LoanActor }) { return loanCapabilities(req.user); }
  @Get(':id') findOne(@Param('id') id: string, @Request() req: { user: LoanActor }) { return this.loansService.findOne(id, req.user); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLoanDto, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.remove(id); }
  @Post(':id/approve') approve(@Param('id') id: string, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.approve(id, req.user.id); }
  @Post(':id/reject') reject(@Param('id') id: string, @Body() body: LoanNotesDto, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.reject(id, req.user.id, body.notes); }
  @Post(':id/deliver') deliver(@Param('id') id: string, @Body() body: LoanNotesDto, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.deliver(id, body.notes); }
  @Post(':id/return') returnLoan(@Param('id') id: string, @Body() body: ReturnLoanDto, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.return(id, body.condition, body.notes); }
  @Post(':id/history') addHistory(@Param('id') id: string, @Body() body: LoanHistoryDto, @Request() req: { user: LoanActor }) { assertCanManageLoanWorkflow(req.user); return this.loansService.addHistory(id, body.action, body.notes); }
}
