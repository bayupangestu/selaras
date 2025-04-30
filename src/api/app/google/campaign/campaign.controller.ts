import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  UseInterceptors
} from '@nestjs/common';
import { CampaignService } from './campaign.service';

@Controller('app/campaign')
export class CampaignController {
  @Inject(CampaignService)
  private readonly campaignService: CampaignService;

  @Get('campaign-list')
  @UseInterceptors(ClassSerializerInterceptor)
  private async getCampaign() {
    const customerId = process.env.GOOGLE_CUSTOMER_ID;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!customerId || !refreshToken) {
      throw new Error(
        'Missing GOOGLE_CUSTOMER_ID or GOOGLE_REFRESH_TOKEN in env'
      );
    }

    return await this.campaignService.getCampaigns(customerId, refreshToken);
  }
}
