import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from '@/entity/ad.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Campaign } from '@/entity/campaign.entity';
import { Insight } from '@/entity/insight.entity';
import { SettingService } from '@/api/cms/setting/setting.service';
import { Setting } from '@/entity/setting.entity';
import { AdAccount } from '@/entity/ad-account.entity';
import { CustomAudience } from '@/entity/custom-audience.entity';
import { InsightListenerService } from '@/shared/subscribers/insight.subscriber';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ad,
      AdSet,
      Campaign,
      Insight,
      Setting,
      AdAccount,
      CustomAudience,
      UserDashboard,
      InsightBreakdown
    ])
  ],
  controllers: [CronController],
  providers: [CronService, SettingService, InsightListenerService]
})
export class CronModule {}
