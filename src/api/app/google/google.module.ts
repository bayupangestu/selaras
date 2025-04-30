import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [AuthModule, CampaignModule]
})
export class GoogleModule {}
