import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const publicUserSelect = { id: true, email: true, username: true, firstName: true, lastName: true, phoneNumber: true, role: true, mustChangePassword: true, isActive: true, createdAt: true, updatedAt: true } satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findAllPublic() { return this.prisma.user.findMany({ select: publicUserSelect, orderBy: { createdAt: 'desc' } }); }
  findOptions() { return this.prisma.user.findMany({ where: { isActive: true }, select: { id: true, username: true, firstName: true, lastName: true, role: true }, orderBy: { username: 'asc' } }); }
  async findOne(usernameOrEmail: string): Promise<User | null> { const identifier = usernameOrEmail.toLowerCase(); return this.prisma.user.findFirst({ where: { OR: [{ username: identifier }, { email: identifier }] } }); }
  findById(id: string): Promise<User | null> { return this.prisma.user.findUnique({ where: { id } }); }
  findPublicById(id: string) { return this.prisma.user.findUnique({ where: { id }, select: publicUserSelect }); }
  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({ data: { email: dto.email.toLowerCase(), username: dto.username.toLowerCase(), password, firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber, role: dto.role ?? Role.END_USER, isActive: dto.isActive ?? true, mustChangePassword: dto.mustChangePassword ?? true }, select: publicUserSelect });
  }
  async updateAdministrative(id: string, dto: UpdateUserDto, actorId: string) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Usuario no encontrado');
    if (id === actorId && (dto.isActive === false || (dto.role && dto.role !== Role.ADMIN))) throw new ForbiddenException('No puede desactivar ni reducir el rol de su propia cuenta');
    const data: Prisma.UserUpdateInput = { ...(dto.email !== undefined && { email: dto.email.toLowerCase() }), ...(dto.username !== undefined && { username: dto.username.toLowerCase() }), ...(dto.firstName !== undefined && { firstName: dto.firstName }), ...(dto.lastName !== undefined && { lastName: dto.lastName }), ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }), ...(dto.role !== undefined && { role: dto.role }), ...(dto.isActive !== undefined && { isActive: dto.isActive }), ...(dto.mustChangePassword !== undefined && { mustChangePassword: dto.mustChangePassword }) };
    if (current.role === Role.ADMIN && (dto.isActive === false || (dto.role && dto.role !== Role.ADMIN))) {
      return this.prisma.$transaction(async (tx) => {
        const count = await tx.user.count({ where: { role: Role.ADMIN, isActive: true } });
        if (count <= 1) throw new ConflictException('Debe existir al menos un administrador activo');
        return tx.user.update({ where: { id }, data, select: publicUserSelect });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }
    return this.prisma.user.update({ where: { id }, data, select: publicUserSelect });
  }
  async removeAdministrative(id: string, actorId: string) {
    if (id === actorId) throw new ForbiddenException('No puede eliminar su propia cuenta');
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Usuario no encontrado');
    if (current.role === Role.ADMIN && current.isActive) {
      return this.prisma.$transaction(async (tx) => {
        const count = await tx.user.count({ where: { role: Role.ADMIN, isActive: true } });
        if (count <= 1) throw new ConflictException('Debe existir al menos un administrador activo');
        await tx.user.delete({ where: { id } });
        return { id };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    }
    try { await this.prisma.user.delete({ where: { id } }); return { id }; } catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') throw new BadRequestException('No se puede eliminar el usuario porque tiene registros asociados'); throw error; }
  }
  async setPassword(id: string, password: string, mustChangePassword: boolean): Promise<void> { const hashedPassword = await bcrypt.hash(password, 10); await this.prisma.user.update({ where: { id }, data: { password: hashedPassword, mustChangePassword } }); }
}
