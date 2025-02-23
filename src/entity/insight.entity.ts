import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterInsert,
  ManyToOne,
  JoinColumn,
  AfterUpdate,
  BeforeInsert,
  OneToMany,
  OneToOne
} from 'typeorm';
import { UserDashboard } from './user-dashboard.entity';
import { AdAccount } from './ad-account.entity';
import { Campaign } from './campaign.entity';
import { AdSet } from './ad-set.entity';
import { Ad } from './ad.entity';
import { InsightBreakdown } from './insight-breakdown.entity';

@Entity('insights')
export class Insight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Ubah tipe data dari `number` ke `string` karena menggunakan UUID

  // @Column({ type: 'varchar' })
  // reference_type: string;

  // @Column({ type: 'varchar' })
  // referenceId: string; // Ubah tipe data dari `any` ke `string`

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.insights)
  @JoinColumn({ name: 'ad_account_id' })
  ad_account_id: AdAccount;

  @ManyToOne(() => Campaign, (campaing) => campaing.insights)
  @JoinColumn({ name: 'campaign_id' })
  campaign_id: Campaign;

  @ManyToOne(() => AdSet, (adset) => adset.insights)
  @JoinColumn({ name: 'adset_id' })
  adset_id: AdSet;

  @ManyToOne(() => Ad, (ad) => ad.insights)
  @JoinColumn({ name: 'ad_id' })
  ad_id: Ad;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  impressions: number;

  @Column({ type: 'int', nullable: true })
  clicks: number;

  @Column({ type: 'float', nullable: true })
  spend: number;

  @Column({ type: 'float', nullable: true })
  ctr: number;

  @Column({ type: 'float', nullable: true })
  cpc: number;

  @Column({ type: 'float', nullable: true })
  cpm: number;

  @Column({ type: 'int', nullable: true })
  reach: number;

  @Column({ type: 'json', nullable: true })
  video_30_sec_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_avg_time_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_play_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  website_ctr: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_outbound_click: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_thruplay: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_unique_action_type: { action_type: string; value: string }[];

  @Column({ type: 'float', nullable: true })
  cost_per_unique_click: number;

  @Column({ type: 'float', nullable: true })
  cost_per_unique_inline_link_click: number;

  @Column({ type: 'json', nullable: true })
  cost_per_unique_outbound_click: { action_type: string; value: string }[];

  @Column({ type: 'varchar', nullable: true })
  engagement_rate_ranking: string;

  @Column({ type: 'json', nullable: true })
  cost_per_action_type: { action_type: string; value: string }[];

  @Column({ type: 'float', nullable: true })
  cost_per_inline_post_engagement: number;

  @Column({ type: 'float', nullable: true })
  inline_link_click_ctr: number;

  @Column({ type: 'int', nullable: true })
  inline_link_clicks: number;

  @Column({ type: 'int', nullable: true })
  inline_post_engagement: number;

  @Column({ type: 'varchar', nullable: true })
  quality_ranking: string;

  @Column({ type: 'json', nullable: true })
  video_p100_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p25_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p50_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p75_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p95_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'int', nullable: true })
  lead: number;

  @Column({ type: 'int', nullable: true })
  link_click: number;

  @Column({ type: 'int', nullable: true })
  post_engagement: number;

  @Column({ type: 'int', nullable: true })
  video_views: number;

  @Column({ type: 'float', nullable: true })
  cost_per_mile: number;

  @Column({ type: 'float', nullable: true })
  cost_per_engagement: number;

  @Column({ type: 'float', nullable: true })
  cost_per_view: number;

  @Column({ type: 'float', nullable: true })
  cost_per_click: number;

  @Column({ type: 'float', nullable: true })
  cost_per_lead: number;

  @Column({ type: 'json', nullable: true })
  video_thruplay_watched_actions: { action_type: string; value: string }[];

  @ManyToOne(
    () => InsightBreakdown,
    (insightBreakdown) => insightBreakdown.insights
  )
  @JoinColumn({ name: 'insight_breakdown_id' })
  insight_breakdown_id: InsightBreakdown;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz' })
  public created_at!: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  public updated_at!: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  public deleted_at: Date | null;
}
