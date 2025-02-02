import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/migrations/user.entity';
import { AuthController } from './auth.controller';
import { AuthHelper } from './auth.helper';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { Role } from '@/migrations/role.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
      })
    }),
    TypeOrmModule.forFeature([User, Role])
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper, JwtStrategy]
})
export class AuthModule {}
