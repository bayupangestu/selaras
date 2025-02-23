import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne
} from 'typeorm';
import { User } from './user.entity';
import { UserCampaign } from './user-campaign.entity';
import { UserAdsets } from './user-adset.entity';
import { UserAd } from './user-ad.entity';
import { CampaignType } from './campaign-type.entity';
import { Exclude } from 'class-transformer';
import { DashboardAttributeVisibility } from './dashboard-attribute-visibility.entity';
import { Campaign } from './campaign.entity';
import { AdSet } from './ad-set.entity';
import { Ad } from './ad.entity';
import { json } from 'stream/consumers';
import { InsightBreakdown } from './insight-breakdown.entity';

@Entity()
export class UserDashboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.dashboards)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => UserCampaign, (campaign) => campaign.dashboards)
  @JoinColumn({ name: 'user_campaign_id' })
  user_campaign_id: UserCampaign;

  @ManyToOne(() => UserAdsets, (adset) => adset.dashboards)
  @JoinColumn({ name: 'user_adset_id' })
  user_adset_id: UserAdsets;

  @ManyToOne(() => UserAd, (userAd) => userAd.dashboards)
  @JoinColumn({ name: 'user_ad_id' })
  user_ad_id: UserAd;

  @ManyToOne(() => CampaignType, (campaignType) => campaignType.dashboards)
  @JoinColumn({ name: 'campaign_type_id' })
  campaign_type_id: CampaignType;

  @ManyToOne(() => Campaign, (campaign) => campaign.user_dashboards)
  @JoinColumn({ name: 'meta_campaign_id' })
  meta_campaign_id: Campaign;

  @ManyToOne(() => AdSet, (adSet) => adSet.user_dashboards)
  @JoinColumn({ name: 'meta_adset_id' })
  meta_adset_id: AdSet;

  @ManyToOne(() => Ad, (ad) => ad.user_dashboards)
  @JoinColumn({ name: 'meta_ad_id' })
  meta_ad_id: Ad;

  @ManyToOne(
    () => DashboardAttributeVisibility,
    (dashboardAttributeVisibility) =>
      dashboardAttributeVisibility.user_dashboards
  )
  @JoinColumn({ name: 'dashboard_attribute_visibility_id' })
  dashboard_attribute_visibility_id: DashboardAttributeVisibility;

  @Column({ type: 'date', nullable: true })
  time_period: Date;

  @Column({ nullable: true })
  reach: number;

  @Column({ nullable: true })
  impression: number;

  @Column({ nullable: true })
  clicks: number;

  @Column({ type: 'float', nullable: true })
  ctr: number;

  @Column({ nullable: true })
  post_engagement: number;

  @Column({ nullable: true, type: 'json' })
  thruplay: any;

  @Column({ nullable: true })
  platform: string;

  @Column({ nullable: true, type: 'json' })
  demography: any;

  @Column({ nullable: true })
  thumbnail_ads: string;

  @Column({ type: 'int', nullable: true })
  lead: number;

  @Column({ type: 'int', nullable: true })
  link_click: number;

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

  @Column({ type: 'float', nullable: true })
  spend: number;

  @ManyToOne(
    () => InsightBreakdown,
    (insightBreakdown) => insightBreakdown.user_dashboards
  )
  @JoinColumn({ name: 'insight_breakdown_id' })
  insight_breakdown_id: InsightBreakdown;

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date;
}
