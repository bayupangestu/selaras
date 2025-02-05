import { Module } from '@nestjs/common';
import { SettingModule } from './setting/setting.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PlatformModule } from './platform/platform.module';
import { UserCampaignModule } from './user_campaign/user_campaign.module';
import { UserAdsetModule } from './user_adset/user_adset.module';
import { UserAdModule } from './user_ad/user_ad.module';

@Module({
  imports: [SettingModule, RoleModule, UserModule, PlatformModule, UserCampaignModule, UserAdsetModule, UserAdModule]
})
export class CmsModule {}
