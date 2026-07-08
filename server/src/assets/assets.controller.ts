import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: any, @Request() req) {
    return this.assetsService.create(createAssetDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('brand') brand?: string,
    @Query('fieldId') fieldId?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.assetsService.findAll({
      status: status as any,
      brand,
      fieldId,
      assignedUserId,
      search,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssetDto: any, @Request() req) {
    return this.assetsService.update(id, updateAssetDto, req.user.id);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { assignedUserId?: string; fieldId?: string }, @Request() req) {
    return this.assetsService.assign(id, body, req.user.id);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
    return this.assetsService.changeStatus(id, status as any, req.user.id);
  }

  @Post(':id/history')
  addHistory(@Param('id') id: string, @Body() body: { action: string, notes?: string }, @Request() req) {
    return this.assetsService.addHistory(id, req.user.id, body.action, body.notes);
  }
}
