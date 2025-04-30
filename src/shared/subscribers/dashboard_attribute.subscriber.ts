import { UserCampaign } from '@/entity/user-campaign.entity';
import { UserDashboard } from '../../entity/user-dashboard.entity';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository
} from 'typeorm';
import { AppDataSource } from '../typeorm/app-data-source';
import { DashboardAttributeVisibility } from '@/entity/dashboard-attribute-visibility.entity';

@EventSubscriber()
@Injectable()
export class UserCampaignListenerService
  implements EntitySubscriberInterface<UserCampaign>
{
  listenTo() {
    return UserCampaign;
  }

  async afterInsert(event: InsertEvent<UserCampaign>): Promise<void> {
    try {
      const dashboardVisibility = AppDataSource.getRepository(
        DashboardAttributeVisibility
      );
      const userCampaign = event.entity;
      const newDashboardAttribute = new DashboardAttributeVisibility();

      switch (userCampaign.campaign_type_id.name) {
        case 'cpm':
          newDashboardAttribute.is_visible = true;
          newDashboardAttribute.user_campaign_id = userCampaign;
          newDashboardAttribute.attribute_name = [
            'time_period',
            'reach',
            'impression',
            'clicks',
            'ctr',
            'post_engagement',
            'views',
            'thruplay',
            'platform',
            'demography',
            'cost_per_mile',
            'spend'
          ];
          break;
        case 'cpe':
          newDashboardAttribute.is_visible = true;
          newDashboardAttribute.user_campaign_id = userCampaign;
          newDashboardAttribute.attribute_name = [
            'time_period',
            'reach',
            'impression',
            'clicks',
            'ctr',
            'post_engagement',
            'views',
            'thruplay',
            'platform',
            'demography',
            'cost_per_engagement',
            'spend'
          ];
          break;
        case 'cpv':
          newDashboardAttribute.is_visible = true;
          newDashboardAttribute.user_campaign_id = userCampaign;
          newDashboardAttribute.attribute_name = [
            'time_period',
            'reach',
            'impression',
            'clicks',
            'ctr',
            'post_engagement',
            'views',
            'thruplay',
            'platform',
            'demography',
            'cost_per_engagement',
            'spend'
          ];
          break;
        case 'cpc':
          newDashboardAttribute.is_visible = true;
          newDashboardAttribute.user_campaign_id = userCampaign;
          newDashboardAttribute.attribute_name = [
            'time_period',
            'reach',
            'impression',
            'clicks',
            'ctr',
            'post_engagement',
            'views',
            'thruplay',
            'platform',
            'demography',
            'cost_per_engagement',
            'spend'
          ];
          break;
        case 'cpl':
          newDashboardAttribute.is_visible = true;
          newDashboardAttribute.user_campaign_id = userCampaign;
          newDashboardAttribute.attribute_name = [
            'time_period',
            'reach',
            'impression',
            'clicks',
            'ctr',
            'post_engagement',
            'views',
            'thruplay',
            'platform',
            'leads',
            'demography',
            'cost_per_engagement',
            'spend'
          ];
          break;
        default:
          // Handle case jika tidak ada yang cocok
          throw new HttpException(
            `Unknown campaign type: ${userCampaign.campaign_type_id.name}`,
            400
          );
      }
      await dashboardVisibility.save(newDashboardAttribute);
    } catch (error) {
      throw new HttpException(
        'Failed to save dashboard attribute visibility',
        500
      );
    }
  }
}
