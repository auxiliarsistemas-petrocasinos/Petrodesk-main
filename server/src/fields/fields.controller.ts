import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  private requireAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden administrar campos.');
    }
  }

  @Post()
  create(@Body() createFieldDto: Prisma.FieldCreateInput, @Request() req) {
    this.requireAdmin(req);
    return this.fieldsService.create(createFieldDto);
  }

  @Get()
  findAll() {
    return this.fieldsService.findAll();
  }

  @Get('permissions')
  getPermissions(@Request() req) {
    return { canManage: req.user?.role === 'ADMIN' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFieldDto: Prisma.FieldUpdateInput, @Request() req) {
    this.requireAdmin(req);
    return this.fieldsService.update(id, updateFieldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    this.requireAdmin(req);
    return this.fieldsService.remove(id);
  }
}
