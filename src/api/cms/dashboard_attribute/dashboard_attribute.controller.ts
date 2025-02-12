import { Controller, Get } from '@nestjs/common';
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
}
