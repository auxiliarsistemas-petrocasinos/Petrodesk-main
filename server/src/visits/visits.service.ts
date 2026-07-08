import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Visit, Prisma } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.visit.findMany({
      include: {
        field: { select: { name: true } },
        createdBy: { select: { username: true, firstName: true, lastName: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(data: any) {
    // Convertir fechas de string a Date
    return this.prisma.visit.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        expensesTotal: parseFloat(data.expensesTotal || '0'),
      },
      include: {
        field: { select: { name: true } },
        createdBy: { select: { username: true, firstName: true, lastName: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.visit.delete({
      where: { id },
    });
  }

  async updateReportPath(id: string, reportPath: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      select: { reportPath: true },
    });

    if (visit?.reportPath) {
      const relativePath = visit.reportPath.startsWith('/') ? visit.reportPath.slice(1) : visit.reportPath;
      const oldFilePath = join(__dirname, '..', '..', relativePath);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error(`Error deleting old report file: ${oldFilePath}`, err);
        }
      }
    }

    return this.prisma.visit.update({
      where: { id },
      data: { reportPath },
      include: {
        field: { select: { name: true } },
        createdBy: { select: { username: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteReport(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      select: { reportPath: true },
    });

    if (visit?.reportPath) {
      const relativePath = visit.reportPath.startsWith('/') ? visit.reportPath.slice(1) : visit.reportPath;
      const filePath = join(__dirname, '..', '..', relativePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error deleting report file: ${filePath}`, err);
        }
      }
    }

    return this.prisma.visit.update({
      where: { id },
      data: { reportPath: null },
      include: {
        field: { select: { name: true } },
        createdBy: { select: { username: true, firstName: true, lastName: true } },
      },
    });
  }
}
