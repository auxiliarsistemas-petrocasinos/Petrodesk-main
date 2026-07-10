import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: Prisma.UserCreateInput): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        role: import("@prisma/client").$Enums.Role;
        mustChangePassword: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
