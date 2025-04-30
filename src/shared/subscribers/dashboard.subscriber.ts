import {
  EntitySubscriberInterface,
  EventSubscriber,
  In,
  InsertEvent
} from 'typeorm';
import { UserCampaign } from '@/entity/user-campaign.entity';
import { Insight } from '@/entity/insight.entity';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@EventSubscriber()
@Injectable()
export class UserCampaignSubscriber
  implements EntitySubscriberInterface<UserCampaign>
{
  listenTo() {
    return UserCampaign;
  }

  async afterInsert(event: InsertEvent<UserCampaign>): Promise<void> {
    // const campaign = event.entity;
    // // Cek apakah ada insight yang cocok berdasarkan campaign_id / adset_id / ad_id
    // const insightRepository = event.manager.getRepository(Insight);
    // const insights = await insightRepository.find({
    //   where: [
    //     { campaign_id: campaign.meta_campaign_id },
    //     { adset_id: In(campaign.user_adsets?.map((a) => a.meta_adset_id)) }, // opsional jika tersedia
    //     { ad_id: In([]) } // atau ambil dari relasi user_ads jika ada
    //   ],
    //   relations: ['campaign_id', 'adset_id', 'ad_id']
    // });
    // if (!insights.length) return;
    // // Loop dan buat user dashboard berdasarkan data insight
    // const dashboards: UserDashboard[] = insights.map((insight) => {
    //   const dashboard = new UserDashboard();
    //   dashboard.user_id = campaign.user_id;
    //   dashboard.user_campaign_id = campaign;
    //   dashboard.meta_campaign_id = insight.campaign_id;
    //   dashboard.meta_adset_id = insight.adset_id;
    //   dashboard.meta_ad_id = insight.ad_id;
    //   dashboard.reach = insight.reach;
    //   dashboard.impression = insight.impressions;
    //   dashboard.clicks = insight.clicks;
    //   dashboard.ctr = insight.ctr;
    //   dashboard.lead = insight.lead;
    //   dashboard.link_click = insight.link_click;
    //   dashboard.video_views = insight.video_views;
    //   dashboard.cost_per_mile = insight.cost_per_mile;
    //   dashboard.cost_per_click = insight.cost_per_click;
    //   dashboard.cost_per_engagement = insight.cost_per_engagement;
    //   dashboard.cost_per_view = insight.cost_per_view;
    //   dashboard.cost_per_lead = insight.cost_per_lead;
    //   dashboard.spend = insight.spend;
    //   dashboard.insight_breakdown_id = insight.insight_breakdown_id;
    //   dashboard.time_period = insight.date;
    //   return dashboard;
    // });
    // await event.manager.getRepository(UserDashboard).save(dashboards);
  }
}
