// src/shared/strategies/meta.strategy.ts
import { HttpException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlatformStrategy } from '../interface/platform-strategy.interface';
import { Campaign } from '@/entity/campaign.entity';
import { AdSet } from '@/entity/ad-set.entity';
import { Ad } from '@/entity/ad.entity';

@Injectable()
export class MetaPlatformStrategy implements PlatformStrategy {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(AdSet)
    private readonly metaAdsetRepository: Repository<AdSet>,
    @InjectRepository(Ad)
    private readonly metaAdRepository: Repository<Ad>
  ) {}

  async validateCampaign(campaignId: string): Promise<any> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId }
    });
    if (!campaign) {
      throw new HttpException('Meta Campaign not found', 404);
    }
    return campaign;
  }

  async validateAdset(adsetId: string): Promise<any> {
    const adset = await this.metaAdsetRepository.findOne({
      where: { id: adsetId }
    });
    if (!adset) {
      throw new HttpException('Meta Adset not found', 404);
    }
    return adset;
  }

  async validateAd(adId: string): Promise<any> {
    const ad = await this.metaAdRepository.findOne({
      where: { id: adId }
    });

    if (!ad) {
      throw new HttpException('Meta Ad not found', 404);
    }
    return ad;
  }
}
