import { Module } from '@nestjs/common';
import { SettingModule } from './setting/setting.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [SettingModule, RoleModule]
})
export class CmsModule {}
