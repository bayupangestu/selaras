import { Module } from '@nestjs/common';
import { UserAdController } from './user_ad.controller';
import { UserAdService } from './user_ad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/api/auth/auth.module';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { User } from '@/entity/user.entity';
import { SharedModule } from '@/shared/shared.module';
import { Ad } from '@/entity/ad.entity';
import { Insight } from '@/entity/insight.entity';
import { DashboardAttributeService } from '../dashboard_attribute/dashboard_attribute.service';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';
import { CronService } from '@/api/app/meta/cron/cron.service';
import { SettingService } from '../setting/setting.service';
import { AdAccount } from '@/entity/ad-account.entity';
import { Campaign } from '@/entity/campaign.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { CustomAudience } from '@/entity/custom-audience.entity';
import { Setting } from '@/entity/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAd,
      UserAdsets,
      User,
      Ad,
      Insight,
      UserDashboard,
      DashboardAttributeVisibility,
      UserCampaign,
      InsightBreakdown,
      AdAccount,
      Campaign,
      AdSet,
      CustomAudience,
      Setting
    ]),
    AuthModule,
    SharedModule
  ],
  controllers: [UserAdController],
  providers: [
    UserAdService,
    DashboardAttributeService,
    CronService,
    SettingService
  ]
})
export class UserAdModule {}
