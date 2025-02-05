import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountInsights } from '@/entity/account.entity';
import axios from 'axios';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountInsights)
    private readonly accountInsightsRepository: Repository<AccountInsights>
  ) {}

  async fetchAndSaveInsights() {
    const url = `${process.env.META_BASE_URL}/${process.env.ACT_ID}/insights`;

    // Define the fields
    const firstFields = `reach,result_values_performance_indicator,shops_assisted_purchases,social_spend,spend,video_30_sec_watched_actions,video_avg_time_watched_actions,video_play_actions,video_play_curve_actions,frequency,website_ctr,website_purchase_roas,cost_per_outbound_click,cost_per_thruplay,cost_per_unique_action_type,cost_per_unique_click,cost_per_unique_inline_link_click,cost_per_unique_outbound_click,cpc,cpm,cpp,ctr,date_start,date_stop,dda_results,engagement_rate_ranking,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_inline_link_click,account_currency,account_id,account_name,action_values,actions,ad_id,ad_name,adset_id,adset_name,attribution_setting,buying_type,campaign_id,campaign_name,canvas_avg_view_percent,canvas_avg_view_time,catalog_segment_value,clicks,conversion_rate_ranking,conversion_values,conversions,converted_product_quantity,converted_product_value,cost_per_action_type,cost_per_conversion,cost_per_estimated_ad_recallers,cost_per_inline_post_engagement,full_view_impressions,full_view_reach,impressions,inline_link_click_ctr,inline_link_clicks,inline_post_engagement`;
    const secondFields = `instagram_upcoming_event_reminders_set,instant_experience_clicks_to_open,instant_experience_clicks_to_start,instant_experience_outbound_clicks,marketing_messages_delivery_rate,mobile_app_purchase_roas,objective,optimization_goal,outbound_clicks,outbound_clicks_ctr,place_page_name,purchase_roas,qualifying_question_qualify_answer_rate,quality_ranking,video_p100_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions`;
    const fields = [
      'reach,result_values_performance_indicator,shops_assisted_purchases,social_spend,spend,video_30_sec_watched_actions,video_avg_time_watched_actions,video_play_actions,video_play_curve_actions,frequency,website_ctr,website_purchase_roas,cost_per_outbound_click,cost_per_thruplay,cost_per_unique_action_type,cost_per_unique_click,cost_per_unique_inline_link_click,cost_per_unique_outbound_click,cpc,cpm,cpp,ctr,date_start,date_stop,dda_results,engagement_rate_ranking,estimated_ad_recall_rate,estimated_ad_recallers,cost_per_inline_link_click,account_currency,account_id,account_name,action_values,actions,ad_id,ad_name,adset_id,adset_name,attribution_setting,buying_type,campaign_id,campaign_name,canvas_avg_view_percent,canvas_avg_view_time,catalog_segment_value,clicks,conversion_rate_ranking,conversion_values,conversions,converted_product_quantity,converted_product_value,cost_per_action_type,cost_per_conversion,cost_per_estimated_ad_recallers,cost_per_inline_post_engagement,full_view_impressions,full_view_reach,impressions,inline_link_click_ctr,inline_link_clicks,inline_post_engagement,instagram_upcoming_event_reminders_set,instant_experience_clicks_to_open,instant_experience_clicks_to_start,instant_experience_outbound_clicks,marketing_messages_delivery_rate,mobile_app_purchase_roas,objective,optimization_goal,outbound_clicks,outbound_clicks_ctr,place_page_name,purchase_roas,qualifying_question_qualify_answer_rate,quality_ranking,video_p100_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions'
    ];

    const fetchData = async (fields: string) => {
      const params = {
        fields,
        time_range: { since: '2024-04-01', until: '2024-06-30' },
        access_token: process.env.ACCESS_TOKEN
      };
      const response = await axios.get(url, { params });
      return response.data?.data || [];
    };

    try {
      // Fetch data with firstFields and create records
      const firstInsightsData = await fetchData(firstFields);
      for (const data of firstInsightsData) {
        const adInsight = this.accountInsightsRepository.create(data);
        await this.accountInsightsRepository.save(adInsight);
      }
      return true;
      // Fetch data with secondFields and update the corresponding records
      const secondInsightsData = await fetchData(secondFields);
      for (const data of secondInsightsData) {
        // Find the record using a unique identifier, e.g., campaign_id or ad_id
        const existingRecord = await this.accountInsightsRepository.findOne({
          where: { campaign_id: data.campaign_id }
        });

        if (existingRecord) {
          // Update the record with new data
          const updatedRecord = this.accountInsightsRepository.merge(
            existingRecord,
            data
          );
          await this.accountInsightsRepository.save(updatedRecord);
        }
      }

      return 'Insights processed and saved successfully!';
    } catch (error) {
      throw new HttpException(
        error.response?.data?.error || 'Unknown error',
        error.response?.status || 500
      );
    }
  }
}
