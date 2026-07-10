import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }
  @Get() findAll() { return this.usersService.findAllPublic(); }
  @Roles(Role.ADMIN, Role.IT_SUPPORT)
  @Get('options') options() { return this.usersService.findOptions(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.usersService.findPublicById(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Request() req: { user: { id: string } }) { return this.usersService.updateAdministrative(id, dto, req.user.id); }
  @Delete(':id') remove(@Param('id') id: string, @Request() req: { user: { id: string } }) { return this.usersService.removeAdministrative(id, req.user.id); }
}
