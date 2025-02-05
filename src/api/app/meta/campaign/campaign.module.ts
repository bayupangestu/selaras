import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '@/entity/campaign.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '@/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, User]), AuthModule],
  controllers: [CampaignController],
  providers: [CampaignService]
})
export class CampaignModule {}
