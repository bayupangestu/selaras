import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  UseInterceptors
} from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('app/cron')
export class CronController {
  @Inject(CronService)
  private readonly cronService: CronService;

  @Get('account')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getAccount() {
    return await this.cronService.getAdAccount();
  }

  @Get('campaign-list')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCampaignList() {
    return await this.cronService.getCampaignList();
  }

  @Get('adset-list')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getAdsetList() {
    return await this.cronService.getAdSetList();
  }

  @Get('ad-list')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getAdList() {
    return await this.cronService.getAdList();
  }
}
