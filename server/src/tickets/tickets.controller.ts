import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request, Delete, ForbiddenException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  private requireAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden editar o eliminar tickets.');
    }
  }

  @Post()
  create(@Body() createTicketDto: any, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('createdById') createdById?: string,
    @Query('fieldId') fieldId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.ticketsService.findAll({
      status: status as any,
      priority: priority as any,
      assignedToId,
      createdById,
      fieldId,
      search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('permissions')
  getPermissions(@Request() req) {
    return { canManage: req.user?.role === 'ADMIN' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: any, @Request() req) {
    this.requireAdmin(req);
    return this.ticketsService.update(id, updateTicketDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.requireAdmin(req);
    return this.ticketsService.remove(id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('assignedToId') assignedToId: string, @Request() req) {
    this.requireAdmin(req);
    return this.ticketsService.assign(id, assignedToId, req.user.id);
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body('comment') comment: string, @Request() req) {
    return this.ticketsService.addComment(id, req.user.id, comment);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.ticketsService.getComments(id);
  }
}
