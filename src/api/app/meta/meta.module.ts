import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AdsModule } from './ads/ads.module';
import { AdsManagerModule } from './ads-manager/ads-manager.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { CronModule } from './cron/cron.module';
import { AdsetsModule } from './adsets/adsets.module';
import { AdModule } from './ad/ad.module';

@Module({
  imports: [
    AccountModule,
    AdsModule,
    AdsManagerModule,
    AuthModule,
    CampaignModule,
    CronModule,
    AdsetsModule,
    AdModule
  ]
})
export class MetaModule {}
