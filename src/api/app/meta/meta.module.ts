import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AdsModule } from './ads/ads.module';
import { AdsManagerModule } from './ads-manager/ads-manager.module';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';
import { InsightModule } from './insight/insight.module';

@Module({
  imports: [
    AccountModule,
    AdsModule,
    AdsManagerModule,
    AuthModule,
    CampaignModule,
    InsightModule
  ]
})
export class MetaModule {}
