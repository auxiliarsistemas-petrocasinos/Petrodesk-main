import { Controller, Get, Res, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tickets/csv')
  async downloadTicketsCsv(@Res() res: Response) {
    const csv = await this.reportsService.generateTicketsCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('tickets.csv');
    return res.send(csv);
  }

  @Get('assets/csv')
  async downloadAssetsCsv(@Res() res: Response) {
    const csv = await this.reportsService.generateAssetsCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('assets.csv');
    return res.send(csv);
  }

  @Get('loans/csv')
  async downloadLoansCsv(@Res() res: Response) {
    const csv = await this.reportsService.generateLoansCsv();
    res.header('Content-Type', 'text/csv');
    res.attachment('loans.csv');
    return res.send(csv);
  }

  @Get('tickets-summary')
  getTicketsSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getTicketsSummary(from, to);
  }

  @Get('assets-summary')
  getAssetsSummary() {
    return this.reportsService.getAssetsSummary();
  }

  @Get('loans-summary')
  getLoansSummary() {
    return this.reportsService.getLoansSummary();
  }
}
