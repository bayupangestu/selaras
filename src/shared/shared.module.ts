// src/shared/shared.module.ts
import { Module } from '@nestjs/common';
import { MetaPlatformStrategy } from './strategies/meta-platform.strategy';
import { GooglePlatformStrategy } from './strategies/google-platform.strategy';
import { PlatformStrategyFactory } from './strategies/platform-strategy.factory';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/entity/campaign.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, AdSet, Ad])],
  providers: [
    MetaPlatformStrategy,
    GooglePlatformStrategy,
    PlatformStrategyFactory
  ],
  exports: [
    MetaPlatformStrategy,
    GooglePlatformStrategy,
    PlatformStrategyFactory
  ]
})
export class SharedModule {}
