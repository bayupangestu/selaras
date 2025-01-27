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
import { AdsService } from './ads.service';

@Controller('app/ads')
export class AdsController {
  @Inject(AdsService)
  private readonly adsService: AdsService;

  @Get('cpm')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCpm(): Promise<any> {
    return await this.adsService.cpm();
  }

  @Get('cpe')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCpe(): Promise<any> {
    return await this.adsService.cpe();
  }

  @Get('cpv')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCpv(): Promise<any> {
    return await this.adsService.cpv();
  }

  @Get('cpc')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCpc(): Promise<any> {
    return await this.adsService.cpc();
  }

  @Get('chart-cpm')
  @UseInterceptors(ClassSerializerInterceptor)
  private async chartCpm(): Promise<any> {
    return await this.adsService.getDailyMetrics();
  }

  @Get('cpm-campaign/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async cpmCampaign(@Param('id') id: string): Promise<any> {
    return await this.adsService.getCampaignSummary(id);
  }

  @Get('cpm-ad-sets/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async cpmAdSets(@Param('id') id: string): Promise<any> {
    return await this.adsService.getAdSetSummary(id);
  }

  @Get('cpm-ad/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  private async cpmAd(@Param('id') id: string): Promise<any> {
    return await this.adsService.getAdSummary(id);
  }
}
