import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('app/auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Post('long-live-token')
  async getLongLivedToken(@Body() body: any) {
    return await this.authService.getLongLivedToken(body.access_token);
  }

  @Get('access-token')
  async accessToken() {
    return await this.authService.getToken();
  }

  @Get('ad-accounts')
  async adAccounts() {
    return await this.authService.getAdAccounts();
  }
}
