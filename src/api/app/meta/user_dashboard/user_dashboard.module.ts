import { Module } from '@nestjs/common';
import { UserDashboardController } from './user_dashboard.controller';
import { UserDashboardService } from './user_dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/api/auth/auth.module';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { Insight } from '@/entity/insight.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { Campaign } from '@/entity/campaign.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';
import { CronService } from '../cron/cron.service';
import { SettingService } from '@/api/cms/setting/setting.service';
import { AdAccount } from '@/entity/ad-account.entity';
import { CustomAudience } from '@/entity/custom-audience.entity';
import { Setting } from '@/entity/setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardAttributeVisibility,
      Insight,
      UserDashboard,
      UserCampaign,
      UserAd,
      UserAdsets,
      Campaign,
      AdSet,
      Ad,
      InsightBreakdown,
      AdAccount,
      CustomAudience,
      Setting
    ]),
    AuthModule
  ],
  controllers: [UserDashboardController],
  providers: [UserDashboardService, CronService, SettingService]
})
export class UserDashboardModule {}
