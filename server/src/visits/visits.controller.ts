import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ForbiddenException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { SupabaseService } from '../supabase.service';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  create(@Body() createVisitDto: any, @Req() req: any) {
    // Asignar el creador automáticamente del token JWT
    return this.visitsService.create({
      ...createVisitDto,
      createdById: req.user.id,
    });
  }

  @Get()
  findAll() {
    return this.visitsService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    // SOLO EL ADMIN PUEDE BORRAR VISITAS
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar visitas.');
    }
    return this.visitsService.remove(id);
  }

  @Post(':id/report')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos PDF.'), false);
        }
      },
    }),
  )
  async uploadReport(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado o formato incorrecto.');
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = `report-${id}-${uniqueSuffix}${ext}`;

    const publicUrl = await this.supabaseService.uploadFile('reports', filename, file.buffer, file.mimetype);

    return this.visitsService.updateReportPath(id, publicUrl);
  }

  @Delete(':id/report')
  deleteReport(@Param('id') id: string) {
    return this.visitsService.deleteReport(id);
  }
}
