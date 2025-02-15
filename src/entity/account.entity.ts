import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account_insights')
export class AccountInsights {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'varchar', nullable: true })
  campaign_id: string;

  @Column({ type: 'varchar', nullable: true })
  account_currency: string;

  @Column({ type: 'varchar', nullable: true })
  account_name: string;

  @Column({ type: 'varchar', nullable: true })
  ad_id: string;

  @Column({ type: 'varchar', nullable: true })
  ad_name: string;

  @Column({ type: 'varchar', nullable: true })
  adset_id: string;

  @Column({ type: 'varchar', nullable: true })
  adset_name: string;

  @Column({ type: 'varchar', nullable: true })
  attribution_setting: string;

  @Column({ type: 'varchar', nullable: true })
  buying_type: string;

  @Column({ type: 'varchar', nullable: true })
  canvas_avg_view_percent: string;

  @Column({ type: 'varchar', nullable: true })
  canvas_avg_view_time: string;

  @Column({ type: 'varchar', nullable: true })
  clicks: string;

  @Column({ type: 'jsonb', nullable: true })
  action_values: any;

  @Column({ type: 'jsonb', nullable: true })
  actions: any;

  @Column({ type: 'varchar', nullable: true })
  campaign_name: string;

  @Column({ type: 'varchar', nullable: true })
  catalog_segment_value: string;

  @Column({ type: 'varchar', nullable: true })
  conversion_rate_ranking: string;

  @Column({ type: 'jsonb', nullable: true })
  conversions: any;

  @Column({ type: 'varchar', nullable: true })
  converted_product_quantity: string;

  @Column({ type: 'varchar', nullable: true })
  converted_product_value: string;

  @Column({ type: 'jsonb', nullable: true })
  cost_per_action_type: any;

  @Column({ type: 'varchar', nullable: true })
  cost_per_conversion: string;

  @Column({ type: 'varchar', nullable: true })
  cost_per_inline_post_engagement: string;

  @Column({ type: 'varchar', nullable: true })
  impressions: string;

  @Column({ type: 'varchar', nullable: true })
  inline_link_click_ctr: string;

  @Column({ type: 'varchar', nullable: true })
  inline_link_clicks: string;

  @Column({ type: 'varchar', nullable: true })
  inline_post_engagement: string;

  @Column({ type: 'varchar', nullable: true })
  instagram_upcoming_event_reminders_set: string;

  @Column({ type: 'varchar', nullable: true })
  instant_experience_clicks_to_open: string;

  @Column({ type: 'varchar', nullable: true })
  instant_experience_clicks_to_start: string;

  @Column({ type: 'varchar', nullable: true })
  instant_experience_outbound_clicks: string;

  @Column({ type: 'varchar', nullable: true })
  objective: string;

  @Column({ type: 'varchar', nullable: true })
  optimization_goal: string;

  @Column({ type: 'varchar', nullable: true })
  outbound_clicks: string;

  @Column({ type: 'varchar', nullable: true })
  outbound_clicks_ctr: string;

  @Column({ type: 'varchar', nullable: true })
  purchase_roas: string;

  @Column({ type: 'varchar', nullable: true })
  quality_ranking: string;

  @Column({ type: 'varchar', nullable: true })
  reach: string;

  @Column({ type: 'varchar', nullable: true })
  result_values_performance_indicator: string;

  @Column({ type: 'varchar', nullable: true })
  shops_assisted_purchases: string;

  @Column({ type: 'varchar', nullable: true })
  social_spend: string;

  @Column({ type: 'varchar', nullable: true })
  spend: string;

  @Column({ type: 'varchar', nullable: true })
  date_start: string;

  @Column({ type: 'varchar', nullable: true })
  date_stop: string;

  @Column({ type: 'varchar', nullable: true })
  dda_results: string;

  @Column({ type: 'varchar', nullable: true })
  engagement_rate_ranking: string;

  @Column({ type: 'varchar', nullable: true })
  estimated_ad_recall_rate: string;

  @Column({ type: 'varchar', nullable: true })
  estimated_ad_recallers: string;

  @Column({ type: 'varchar', nullable: true })
  video_play_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_avg_time_watched_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_p100_watched_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_p25_watched_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_p50_watched_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_p75_watched_actions: string;

  @Column({ type: 'varchar', nullable: true })
  video_p95_watched_actions: string;
}
