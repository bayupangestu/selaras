import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '@/migrations/setting.entity';
import { SettingController } from './setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingService],
  controllers: [SettingController],
  exports: [SettingService]
})
export class SettingModule {}
