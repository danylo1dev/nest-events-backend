import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from './strategies/curent-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  async login(@CurrentUser() user) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }
  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@CurrentUser() user) {
    return user;
  }
}
