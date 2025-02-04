import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/migrations/campaign.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '@/migrations/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, User]), AuthModule],
  controllers: [CampaignController],
  providers: [CampaignService]
})
export class CampaignModule {}
