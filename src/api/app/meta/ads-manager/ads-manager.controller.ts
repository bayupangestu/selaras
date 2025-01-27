import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { AdsManagerService } from './ads-manager.service';

@Controller('app/ads-manager')
export class AdsManagerController {
  @Inject(AdsManagerService)
  private readonly adsManagerService: AdsManagerService;

  @Get('campaigns')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCampaign(): Promise<any> {
    return await this.adsManagerService.getCampaigns();
  }

  @Get('ad-sets/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getAdSet(@Param('id') id: string): Promise<any> {
    return await this.adsManagerService.getAdSets(id);
  }

  @Get('ads/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getAds(@Param('id') id: string): Promise<any> {
    return await this.adsManagerService.getAds(id);
  }
}
