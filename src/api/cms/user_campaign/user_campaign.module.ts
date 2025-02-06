import { Module } from '@nestjs/common';
import { UserCampaignController } from './user_campaign.controller';
import { UserCampaignService } from './user_campaign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platform } from '@/entity/platform.entity';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { User } from '@/entity/user.entity';
import { AuthModule } from '@/api/auth/auth.module';
import { Campaign } from '@/entity/campaign.entity';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Platform, UserCampaign, User, Campaign]),
    AuthModule,
    SharedModule
  ],
  controllers: [UserCampaignController],
  providers: [UserCampaignService]
})
export class UserCampaignModule {}
