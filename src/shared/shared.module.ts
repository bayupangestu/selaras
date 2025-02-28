import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MetaPlatformStrategy } from './strategies/meta-platform.strategy';
import { GooglePlatformStrategy } from './strategies/google-platform.strategy';
import { PlatformStrategyFactory } from './strategies/platform-strategy.factory';
import { Campaign } from '@/entity/campaign.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { InsightListenerService } from './subscribers/insight.subscriber';
import { DashboardListenerService } from './subscribers/dashboard.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, AdSet, Ad, UserDashboard])],
  providers: [
    MetaPlatformStrategy,
    GooglePlatformStrategy,
    PlatformStrategyFactory,
    // {
    //   provide: InsightListenerService,
    //   useFactory: (dataSource: DataSource) =>
    //     new InsightListenerService(dataSource),
    //   inject: [DataSource]
    // }
    InsightListenerService,
    DashboardListenerService
  ],
  exports: [
    MetaPlatformStrategy,
    GooglePlatformStrategy,
    PlatformStrategyFactory,
    InsightListenerService,
    DashboardListenerService
  ]
})
export class SharedModule {}
