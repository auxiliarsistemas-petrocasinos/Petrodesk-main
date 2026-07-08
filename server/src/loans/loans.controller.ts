import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: any, @Request() req) {
    return this.loansService.create(createLoanDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('assetId') assetId?: string,
    @Query('overdue') overdue?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.loansService.findAll({
      status: status as LoanStatus,
      userId,
      assetId,
      overdue: overdue === 'true',
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: any) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.loansService.approve(id, req.user.id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body('notes') notes: string, @Request() req) {
    return this.loansService.reject(id, req.user.id, notes);
  }

  @Post(':id/deliver')
  deliver(@Param('id') id: string, @Body('notes') notes: string) {
    return this.loansService.deliver(id, notes);
  }

  @Post(':id/return')
  return(
    @Param('id') id: string,
    @Body('condition') condition: string,
    @Body('notes') notes: string,
  ) {
    return this.loansService.return(id, condition, notes);
  }

  @Post(':id/history')
  addHistory(@Param('id') id: string, @Body() body: { action: string, notes?: string }) {
    return this.loansService.addHistory(id, body.action, body.notes);
  }
}
