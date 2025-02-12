import { Module } from '@nestjs/common';
import { SettingModule } from './setting/setting.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { PlatformModule } from './platform/platform.module';
import { UserCampaignModule } from './user_campaign/user_campaign.module';
import { UserAdsetModule } from './user_adset/user_adset.module';
import { UserAdModule } from './user_ad/user_ad.module';
import { UserProjectModule } from './user_project/user_project.module';
import { CampaignTypeModule } from './campaign_type/campaign_type.module';
import { DashboardAttributeModule } from './dashboard_attribute/dashboard_attribute.module';

@Module({
  imports: [SettingModule, RoleModule, UserModule, PlatformModule, UserCampaignModule, UserAdsetModule, UserAdModule, UserProjectModule, CampaignTypeModule, DashboardAttributeModule]
})
export class CmsModule {}
