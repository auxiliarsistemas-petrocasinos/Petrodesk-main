import { Role } from '@prisma/client';
export class CreateUserDto { email!: string; username!: string; password!: string; firstName?: string; lastName?: string; phoneNumber?: string; role?: Role; isActive?: boolean; mustChangePassword?: boolean; }
export class UpdateUserDto { email?: string; username?: string; firstName?: string; lastName?: string; phoneNumber?: string; role?: Role; isActive?: boolean; mustChangePassword?: boolean; }
