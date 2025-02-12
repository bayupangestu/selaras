import { Module } from '@nestjs/common';
import { DashboardAttributeController } from './dashboard_attribute.controller';
import { DashboardAttributeService } from './dashboard_attribute.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';
import { Insight } from '@/entity/insight.entity';
import { AuthModule } from '@/api/auth/auth.module';
import { UserDashboard } from '@/entity/user-dashboard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardAttributeVisibility,
      Insight,
      UserDashboard
    ]),
    AuthModule
  ],
  controllers: [DashboardAttributeController],
  providers: [DashboardAttributeService]
})
export class DashboardAttributeModule {}
