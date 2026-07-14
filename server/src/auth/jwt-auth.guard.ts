import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ALLOW_PASSWORD_CHANGE_PENDING } from './password-change.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super(); }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const allowed = this.reflector.getAllAndOverride<boolean>(ALLOW_PASSWORD_CHANGE_PENDING, [context.getHandler(), context.getClass()]);
    if (request.user?.mustChangePassword && !allowed) throw new ForbiddenException('Debe cambiar la contrasena antes de continuar');
    return Boolean(authenticated);
  }
}
