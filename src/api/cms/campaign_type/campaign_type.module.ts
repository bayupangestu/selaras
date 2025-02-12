import { Module } from '@nestjs/common';
import { CampaignTypeController } from './campaign_type.controller';
import { CampaignTypeService } from './campaign_type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignType } from '@/entity/campaign-type.entity';
import { AuthModule } from '@/api/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignType]), AuthModule],
  controllers: [CampaignTypeController],
  providers: [CampaignTypeService]
})
export class CampaignTypeModule {}
