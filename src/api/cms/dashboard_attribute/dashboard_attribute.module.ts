import { Module } from '@nestjs/common';
import { DashboardAttributeController } from './dashboard_attribute.controller';
import { DashboardAttributeService } from './dashboard_attribute.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/api/auth/auth.module';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { Insight } from '@/entity/insight.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserAd } from '@/entity/user-ad.entity';
import { UserAdsets } from '@/entity/user-adset.entity';
import { InsightBreakdown } from '@/entity/insight-breakdown.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardAttributeVisibility,
      Insight,
      UserDashboard,
      UserCampaign,
      UserAd,
      UserAdsets,
      InsightBreakdown
    ]),
    AuthModule
  ],
  controllers: [DashboardAttributeController],
  providers: [DashboardAttributeService]
})
export class DashboardAttributeModule {}
