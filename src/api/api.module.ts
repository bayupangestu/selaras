import { Module } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [AppModule, SettingModule],
  exports: [SettingModule]
})
export class ApiModule {}
