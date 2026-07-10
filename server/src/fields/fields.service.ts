import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Field, Prisma } from '@prisma/client';

@Injectable()
export class FieldsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.FieldCreateInput): Promise<Field> {
    return this.prisma.field.create({ data });
  }

  async findAll(): Promise<Field[]> {
    return this.prisma.field.findMany();
  }

  async findOne(id: string): Promise<Field> {
    const field = await this.prisma.field.findUnique({ where: { id } });
    if (!field) throw new NotFoundException('Campo no encontrado');
    return field;
  }

  async update(id: string, data: Prisma.FieldUpdateInput): Promise<Field> {
    return this.prisma.field.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Field> {
    try {
      return await this.prisma.field.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException('No se puede eliminar un campo con activos, tickets o visitas asociados.');
      }
      throw error;
    }
  }
}
