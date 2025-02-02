import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ad } from '@/migrations/ad.entity';
import { AdSet } from '@/migrations/ad-set.entity';
import { Campaign } from '@/migrations/campaign.entity';
import { Insight } from '@/migrations/insight.entity';
import { SettingService } from '@/api/cms/setting/setting.service';
import { Setting } from '@/migrations/setting.entity';
import { AdAccount } from '@/migrations/ad-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ad, AdSet, Campaign, Insight, Setting, AdAccount])
  ],
  controllers: [CronController],
  providers: [CronService, SettingService]
})
export class CronModule {}
