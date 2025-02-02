import { Module } from '@nestjs/common';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [SettingModule]
})
export class CmsModule {}
