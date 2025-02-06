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
  UseInterceptors,
  Put,
  Delete
} from '@nestjs/common';
import { UserCampaignService } from './user_campaign.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('cms/user-campaign')
export class UserCampaignController {
  @Inject(UserCampaignService)
  private readonly userCampaignService: UserCampaignService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async createUserCampaign(@Body() body: any) {
    return await this.userCampaignService.createUserCampaign(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllUserCampaigns(@Query() query: any) {
    return await this.userCampaignService.findAllUserCampaigns(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneUserCampaign(@Param('id') id: string) {
    return await this.userCampaignService.findOneUserCampaign(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUserCampaign(@Param('id') id: string, @Body() body: any) {
    return await this.userCampaignService.updateUserCampaign(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteUserCampaign(@Param('id') id: string) {
    return await this.userCampaignService.deleteUserCampaign(id);
  }
}
