import { Insight } from '../../entity/insight.entity';
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

@EventSubscriber()
@Injectable()
export class InsightListenerService
  implements EntitySubscriberInterface<Insight>
{
  listenTo() {
    return Insight;
  }

  // async afterInsert(event: InsertEvent<Insight>) {
  //   try {
  //     const userDashboardRepository =
  //       AppDataSource.getRepository(UserDashboard);
  //     const insight = event.entity;

  //     // Bangun array where secara dinamis
  //     const whereConditions = [];

  //     if (insight.campaign_id?.id) {
  //       whereConditions.push({
  //         meta_campaign_id: { id: insight.campaign_id.id }
  //       });
  //     }

  //     if (insight.adset_id?.id) {
  //       whereConditions.push({
  //         meta_adset_id: { id: insight.adset_id.id }
  //       });
  //     }

  //     if (insight.ad_id?.id) {
  //       whereConditions.push({ meta_ad_id: { id: insight.ad_id.id } });
  //     }

  //     // Jika tidak ada kondisi yang valid, keluar dari fungsi
  //     if (whereConditions.length === 0) {
  //       return;
  //     }
  //     console.log(whereConditions);

  //     // Jalankan query findOne dengan kondisi yang valid
  //     const dashboardData = await userDashboardRepository.findOne({
  //       relations: {
  //         meta_campaign_id: true,
  //         meta_ad_id: true,
  //         meta_adset_id: true
  //       },
  //       where: whereConditions
  //     });

  //     if (!dashboardData) {
  //       return;
  //     }

  //     dashboardData.time_period = insight.date;
  //     dashboardData.reach = insight.reach;
  //     dashboardData.impression = insight.impressions;
  //     dashboardData.clicks = insight.clicks;
  //     dashboardData.ctr = Number(insight.ctr);
  //     dashboardData.post_engagement = insight.inline_post_engagement;
  //     dashboardData.views = null;
  //     dashboardData.thruplay = insight.cost_per_thruplay;
  //     dashboardData.platform = insight.publisher_platform;
  //     dashboardData.demography = {
  //       age: insight.age,
  //       gender: insight.gender
  //     };
  //     dashboardData.thumbnail_ads = null;
  //     dashboardData.leads = null;

  //     await userDashboardRepository.update(dashboardData.id, dashboardData);
  //   } catch (err) {
  //     console.log(err, 'err subscriber');
  //     throw new HttpException(err.message, 400);
  //   }
  // }

  async afterInsert(event: InsertEvent<Insight>) {
    try {
      const userDashboardRepository =
        AppDataSource.getRepository(UserDashboard);
      const insight = event.entity;

      // Bangun array where secara dinamis
      const whereConditions = [];
      if (insight.campaign_id?.id) {
        whereConditions.push({
          meta_campaign_id: { id: insight.campaign_id.id }
        });
      }
      if (insight.adset_id?.id) {
        whereConditions.push({ meta_adset_id: { id: insight.adset_id.id } });
      }
      if (insight.ad_id?.id) {
        whereConditions.push({ meta_ad_id: { id: insight.ad_id.id } });
      }

      // Jika tidak ada kondisi yang valid, keluar dari fungsi
      if (whereConditions.length === 0) {
        console.warn('No valid conditions found for insight');
        return;
      }

      console.log(whereConditions);

      // Jalankan query findOne dengan kondisi yang valid
      const dashboardData = await userDashboardRepository.findOne({
        relations: {
          meta_campaign_id: true,
          meta_ad_id: true,
          meta_adset_id: true,
          user_id: true,
          campaign_type_id: true,
          user_ad_id: true,
          user_adset_id: true,
          user_campaign_id: true,
          dashboard_attribute_visibility_id: true
        },
        where: whereConditions
      });

      if (!dashboardData) {
        return;
      }

      // Jika data dashboard ditemukan, periksa time_period
      console.log(dashboardData.time_period, dashboardData.id, '<<<<<<<<');

      if (
        !dashboardData.time_period ||
        dashboardData.time_period === insight.date
      ) {
        // Update data jika time_period sama
        dashboardData.time_period = insight.date;
        dashboardData.reach = insight.reach;
        dashboardData.impression = insight.impressions;
        dashboardData.clicks = insight.clicks;
        dashboardData.ctr = Number(insight.ctr);
        dashboardData.post_engagement = insight.post_engagement;
        dashboardData.views = null;
        dashboardData.thruplay = insight.cost_per_thruplay;
        // dashboardData.platform = insight.publisher_platform;
        // dashboardData.demography = {
        //   age: insight.age,
        //   gender: insight.gender
        // };
        dashboardData.thumbnail_ads = null;
        dashboardData.lead = insight.lead;
        dashboardData.video_views = insight.video_views;
        dashboardData.link_click = insight.link_click;
        dashboardData.cost_per_click = insight.cost_per_click;
        dashboardData.cost_per_mile = insight.cost_per_mile;
        dashboardData.cost_per_view = insight.cost_per_view;
        dashboardData.cost_per_lead = insight.cost_per_lead;
        dashboardData.cost_per_engagement = insight.cost_per_engagement;
        dashboardData.spend = insight.spend;
        dashboardData.insight_breakdown_id = insight.insight_breakdown_id;

        // Simpan perubahan
        await userDashboardRepository.update(dashboardData.id, dashboardData);
        console.log('Existing dashboard data updated');
        return;
      } else if (dashboardData.time_period !== insight.date) {
        // Buat data baru jika time_period berbeda
        const newDashboardData = new UserDashboard();
        newDashboardData.time_period = insight.date;
        newDashboardData.reach = insight.reach;
        newDashboardData.impression = insight.impressions;
        newDashboardData.clicks = insight.clicks;
        newDashboardData.ctr = Number(insight.ctr);
        newDashboardData.post_engagement = insight.inline_post_engagement;
        newDashboardData.views = null;
        newDashboardData.thruplay = insight.cost_per_thruplay;
        // newDashboardData.platform = insight.publisher_platform;
        // newDashboardData.demography = {
        //   age: insight.age,
        //   gender: insight.gender
        // };
        newDashboardData.thumbnail_ads = null;
        newDashboardData.lead = insight.lead;
        newDashboardData.video_views = insight.video_views;
        newDashboardData.link_click = insight.link_click;
        newDashboardData.cost_per_click = insight.cost_per_click;
        newDashboardData.cost_per_mile = insight.cost_per_mile;
        newDashboardData.cost_per_view = insight.cost_per_view;
        newDashboardData.cost_per_lead = insight.cost_per_lead;
        newDashboardData.cost_per_engagement = insight.cost_per_engagement;
        newDashboardData.user_id = dashboardData.user_id;
        newDashboardData.campaign_type_id = dashboardData.campaign_type_id;
        newDashboardData.dashboard_attribute_visibility_id =
          dashboardData.dashboard_attribute_visibility_id;
        newDashboardData.spend = insight.spend;
        newDashboardData.insight_breakdown_id = insight.insight_breakdown_id;

        // Set relasi berdasarkan kondisi yang tersedia
        if (insight.campaign_id?.id) {
          newDashboardData.meta_campaign_id = insight.campaign_id;
          newDashboardData.user_campaign_id = dashboardData.user_campaign_id;
        }
        if (insight.adset_id?.id) {
          newDashboardData.meta_adset_id = insight.adset_id;
          newDashboardData.user_adset_id = dashboardData.user_adset_id;
        }
        if (insight.ad_id?.id) {
          newDashboardData.meta_ad_id = insight.ad_id;
          newDashboardData.user_ad_id = dashboardData.user_ad_id;
        }

        // Simpan data baru
        await userDashboardRepository.save(newDashboardData);
        console.log('New dashboard data created due to different time_period');
      }
    } catch (err) {
      console.error(err, 'err subscriber');
      throw new HttpException(err.message, 400);
    }
  }
}
