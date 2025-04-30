import {
  Body,
  Controller,
  Inject,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Req,
  Put,
  Get,
  Res,
  Query
} from '@nestjs/common';
import { User } from '@/entity/user.entity';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { google } from 'googleapis';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly service: AuthService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  private register(@Body() body: any): Promise<User | never> {
    return this.service.register(body);
  }

  @Post('login')
  private login(@Body() body: any) {
    return this.service.login(body);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  private refresh(@Req() { user }: Request): Promise<string | never> {
    return this.service.refresh(<User>user);
  }

  @Post('update-password')
  private async updatePassword(@Body() body: any) {
    return await this.service.updatePassword(body);
  }

  @Get('google')
  async googleLogin(@Res() res: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // ⬅️ wajib untuk dapat refresh token
      prompt: 'consent', // ⬅️ paksa muncul consent screen
      scope: [
        'email',
        'profile',
        'openid',
        'https://www.googleapis.com/auth/adwords'
      ]
    });

    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userinfo = await oauth2.userinfo.get();

      return res.json({
        message: 'Login berhasil',
        user: {
          googleId: userinfo.data.id,
          name: userinfo.data.name,
          email: userinfo.data.email,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token // ⬅️ ini bakal muncul kalau semua syarat terpenuhi
        }
      });
    } catch (error) {
      console.error('❌ Google callback error:', error);
      return res.status(500).json({ message: 'Gagal login Google', error });
    }
  }
}
