import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(signInDto.username, signInDto.password);
    if (!user) throw new UnauthorizedException('Credenciales invalidas');
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { id: string } }) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-initial-password')
  async changeInitialPassword(
    @Request() req: { user: { id: string } },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.authService.changeInitialPassword(req.user.id, body.currentPassword, body.newPassword);
  }
}
