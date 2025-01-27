import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '@/migrations/setting.entity';
import { HttpModule } from '@nestjs/axios';
import { MetaConfig } from '@/constants/meta';
import { SettingService } from '@/api/setting/setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [AuthController],
  providers: [AuthService, MetaConfig, SettingService]
})
export class AuthModule {}
