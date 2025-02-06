import { HttpException, Injectable } from '@nestjs/common';
import { PlatformStrategy } from '../interface/platform-strategy.interface';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GooglePlatformStrategy implements PlatformStrategy {
  //   constructor(
  //     @InjectRepository(GoogleCampaign) // Asumsikan ada repository khusus untuk Google
  //     private readonly googleCampaignRepository: Repository<GoogleCampaign>
  //   ) {}
  async validateCampaign(campaignId: string): Promise<any> {
    return 'belum buat google';
    //   const googleCampaign = await this.googleCampaignRepository.findOne({
    //     where: { id: campaignId }
    //   });
    //   if (!googleCampaign) {
    //     throw new HttpException('Google Campaign not found', 404);
    //   }
    //   return googleCampaign;
  }
  async validateAdset(campaignId: string): Promise<any> {
    return 'belum buat google';
    //   const googleCampaign = await this.googleCampaignRepository.findOne({
    //     where: { id: campaignId }
    //   });
    //   if (!googleCampaign) {
    //     throw new HttpException('Google Campaign not found', 404);
    //   }
    //   return googleCampaign;
  }
  async validateAd(campaignId: string): Promise<any> {
    return 'belum buat google';
    //   const googleCampaign = await this.googleCampaignRepository.findOne({
    //     where: { id: campaignId }
    //   });
    //   if (!googleCampaign) {
    //     throw new HttpException('Google Campaign not found', 404);
    //   }
    //   return googleCampaign;
  }
}
