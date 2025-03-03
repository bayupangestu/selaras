import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { UserDashboardService } from './user_dashboard.service';
import { JwtAuthGuard } from '@/api/auth/auth.guard';

@Controller('app/user-dashboard')
export class UserDashboardController {
  @Inject(UserDashboardService)
  private readonly userDashboardService: UserDashboardService;

  @Get('campaign-user-dashboard')
  @UseGuards(JwtAuthGuard)
  async campaignUserDashboard(@Query() query: any) {
    return await this.userDashboardService.campaignUserDashboard(query);
  }

  @Get('adset-user-dashboard')
  @UseGuards(JwtAuthGuard)
  async adSetUserDashboard(@Query() query: any) {
    return await this.userDashboardService.adSetDashboard(query);
  }

  @Get('ad-user-dashboard')
  @UseGuards(JwtAuthGuard)
  async adUserDashboard(@Query() query: any) {
    return await this.userDashboardService.adDashboard(query);
  }

  @Get('campaign-list')
  @UseGuards(JwtAuthGuard)
  async getCampaign(@Query() query: any, @Req() req: any) {
    return await this.userDashboardService.getCampaign(query, req.user);
  }

  @Get('adset-list')
  @UseGuards(JwtAuthGuard)
  async getAdset(@Query() query: any) {
    return await this.userDashboardService.getAdSets(query);
  }

  @Get('ad-list')
  @UseGuards(JwtAuthGuard)
  async getAd(@Query() query: any) {
    return await this.userDashboardService.getAds(query);
  }

  @Get('filter-list')
  async filterList() {
    return await this.userDashboardService.getFilterList();
  }

  @Get('filter-value')
  async filterValue(@Query() query: any) {
    return await this.userDashboardService.getFilterValue(query.column);
  }

  @Post('report')
  async getCustomerReport(@Res() res: any, @Body() body: any) {
    return await this.userDashboardService.getDataCardReportCsv(res, body);
  }
}
