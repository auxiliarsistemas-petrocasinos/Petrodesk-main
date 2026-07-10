import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ChangeInitialPasswordDto, LoginDto } from './auth.dto';
import { AllowPasswordChangePending } from './password-change.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() signInDto: LoginDto) {
    const user = await this.authService.validateUser(signInDto.username, signInDto.password);
    if (!user) throw new UnauthorizedException('Credenciales invalidas');
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @AllowPasswordChangePending()
  @Get('me')
  me(@Request() req: { user: { id: string } }) {
    return this.authService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @AllowPasswordChangePending()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('change-initial-password')
  async changeInitialPassword(
    @Request() req: { user: { id: string } },
    @Body() body: ChangeInitialPasswordDto,
  ) {
    await this.authService.changeInitialPassword(req.user.id, body.currentPassword, body.newPassword);
  }
}
