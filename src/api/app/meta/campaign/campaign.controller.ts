import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('app/meta/campaign')
export class CampaignController {
  @Inject(CampaignService)
  private readonly campaignService: CampaignService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async createCampagin(@Body() body: any, @Req() req: any) {
    return await this.campaignService.createCampaign(body, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findAllCampaign(@Req() req: any, @Query() query: any) {
    return await this.campaignService.findAllCampaign(query, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async findOneCampaign(
    @Req() req: any,
    @Query() query: any,
    @Param('id') id: string
  ) {
    return await this.campaignService.findOneCampaign(query, req.user, id);
  }
}
