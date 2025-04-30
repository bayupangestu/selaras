import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/adwords',
        'openid'
      ],
      accessType: 'offline',
      prompt: 'consent'
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    console.log('REFRESH TOKEN:', refreshToken); // 🔍
    const { id, displayName, emails } = profile;
    const user = {
      googleId: id,
      name: displayName,
      email: emails[0].value,
      accessToken,
      refreshToken
    };

    done(null, user);
  }
}
