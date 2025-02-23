import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res
} from '@nestjs/common';
import { DashboardAttributeService } from './dashboard_attribute.service';

@Controller('cms/dashboard-attribute')
export class DashboardAttributeController {
  constructor(
    private readonly dashboardAttributeService: DashboardAttributeService
  ) {}

  @Get('visible-columns')
  async getVisibleColumns() {
    return await this.dashboardAttributeService.getAttribute();
  }

  @Get('campaign-user-dashboard')
  async campaignUserDashboard(@Query() query: any) {
    return await this.dashboardAttributeService.campaignUserDashboard(query);
  }
  x;
  @Get('adset-user-dashboard')
  async adSetUserDashboard(@Query() query: any) {
    return await this.dashboardAttributeService.adSetDashboard(query);
  }

  @Get('ad-user-dashboard')
  async adUserDashboard(@Query() query: any) {
    return await this.dashboardAttributeService.adDashboard(query);
  }

  @Get('filter-list')
  async filterList() {
    return await this.dashboardAttributeService.getFilterList();
  }

  @Get('filter-value')
  async filterValue(@Query() query: any) {
    return await this.dashboardAttributeService.getFilterValue(query.column);
  }

  @Get('report')
  async getCustomerReport(@Res() res: any, @Body() body: any) {
    return await this.dashboardAttributeService.getDataCardReportCsv(res, body);
  }

  @Post('custom-dashboard')
  async customDashboard(@Body() body: any) {
    return await this.dashboardAttributeService.customDashboard(body);
  }

  @Get('list-custom-dashboard')
  async listCustomDashboard(@Query() query: any) {
    return await this.dashboardAttributeService.listCustomDashboard(query);
  }

  @Get('custom-dashboard/:id')
  async detailCustomDashboard(@Param('id') id: string) {
    return await this.dashboardAttributeService.detailCustomDashboard(id);
  }

  @Put('update-custom-dashboard/:id')
  async updateCustomDashboard(@Param('id') id: string, @Body() body: any) {
    return await this.dashboardAttributeService.update(id, body);
  }
}
