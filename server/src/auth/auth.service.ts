import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user?.isActive && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException();
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async changeInitialPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user?.isActive || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('No fue posible validar las credenciales');
    }
    if (!user.mustChangePassword) throw new BadRequestException('El cambio inicial ya fue completado');
    if (newPassword.length < 12 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      throw new BadRequestException('La nueva contrasena no cumple la politica de seguridad');
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new BadRequestException('La nueva contrasena debe ser diferente');
    }
    await this.usersService.setPassword(userId, newPassword, false);
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}
