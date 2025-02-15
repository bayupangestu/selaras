import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { AdAccount } from './ad-account.entity';
import { AdSet } from './ad-set.entity';
import { Insight } from './insight.entity';
import { User } from './user.entity';
import { Ad } from './ad.entity';
import { UserCampaign } from './user-campaign.entity';
import { UserDashboard } from './user-dashboard.entity';

@Entity('campaigns')
export class Campaign extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'campaign_meta_id', nullable: true })
  campaign_meta_id!: string;

  @OneToMany(
    () => UserCampaign,
    (userCampaign) => userCampaign.meta_campaign_id
  )
  user_campaigns: UserCampaign[];

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.campaigns)
  @JoinColumn({ name: 'ad_account_id' })
  ad_account: AdAccount;

  @ManyToOne(() => User, (user) => user.campaign)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @OneToMany(() => AdSet, (adSet) => adSet.campaign)
  adSets: AdSet[];

  @OneToMany(() => Ad, (ad) => ad.campaign_id)
  ads: Ad[];

  @OneToMany(() => Insight, (insight) => insight.campaign_id)
  insights: Insight[];

  @OneToMany(
    () => UserDashboard,
    (userDashboard) => userDashboard.meta_campaign_id
  )
  user_dashboards: UserDashboard[];

  @Column({ name: 'account_id', nullable: true })
  account_id: string;

  @Column({ name: 'adlabels', type: 'json', nullable: true })
  adlabels: any;

  @Column({ name: 'bid_strategy', nullable: true })
  bid_strategy: string;

  @Column({ name: 'boosted_object_id', nullable: true })
  boosted_object_id: string;

  @Column({ name: 'brand_lift_studies', type: 'json', nullable: true })
  brand_lift_studies: any;

  @Column({ name: 'budget_rebalance_flag', default: false })
  budget_rebalance_flag: boolean;

  @Column({ name: 'budget_remaining', nullable: true, type: 'decimal' })
  budget_remaining: string;

  @Column({ name: 'buying_type', nullable: true })
  buying_type: string;

  @Column({ name: 'campaign_group_active_time', nullable: true })
  campaign_group_active_time: string;

  @Column({ name: 'can_create_brand_lift_study', default: false })
  can_create_brand_lift_study: boolean;

  @Column({ name: 'can_use_spend_cap', default: false })
  can_use_spend_cap: boolean;

  @Column({ name: 'configured_status', nullable: true })
  configured_status: string;

  @Column({ name: 'created_time', type: 'timestamptz', nullable: true })
  created_time: Date;

  @Column({ name: 'daily_budget', nullable: true, type: 'decimal' })
  daily_budget: string;

  @Column({ name: 'effective_status', nullable: true })
  effective_status: string;

  @Column({ name: 'has_secondary_skadnetwork_reporting', default: false })
  has_secondary_skadnetwork_reporting: boolean;

  @Column({ name: 'is_budget_schedule_enabled', default: false })
  is_budget_schedule_enabled: boolean;

  @Column({ name: 'is_skadnetwork_attribution', default: false })
  is_skadnetwork_attribution: boolean;

  @Column({ name: 'issues_info', type: 'json', nullable: true })
  issues_info: any;

  @Column({
    name: 'last_budget_toggling_time',
    type: 'timestamptz',
    nullable: true
  })
  last_budget_toggling_time: Date;

  @Column({ name: 'lifetime_budget', nullable: true, type: 'decimal' })
  lifetime_budget: string;

  @Column({ nullable: true })
  objective: string;

  @Column({ name: 'pacing_type', type: 'json', nullable: true })
  pacing_type: any;

  @Column({ name: 'primary_attribution', nullable: true })
  primary_attribution: string;

  @Column({ name: 'promoted_object', type: 'json', nullable: true })
  promoted_object: any;

  @Column({ name: 'smart_promotion_type', nullable: true })
  smart_promotion_type: string;

  @Column({ name: 'source_campaign', nullable: true })
  source_campaign: string;

  @Column({ name: 'source_campaign_id', nullable: true })
  source_campaign_id: string;

  @Column('text', { array: true, name: 'special_ad_categories', default: [] })
  special_ad_categories: string[];

  @Column({ name: 'special_ad_category', nullable: true })
  special_ad_category: string;

  @Column({ name: 'special_ad_category_country', type: 'json', nullable: true })
  special_ad_category_country: any;

  @Column({ name: 'spend_cap', nullable: true, type: 'decimal' })
  spend_cap: string;

  @Column({ name: 'start_time', type: 'timestamptz', nullable: true })
  start_time: Date;

  @Column({ name: 'status', nullable: true })
  status: string;

  @Column({ name: 'stop_time', type: 'timestamptz', nullable: true })
  stop_time: Date;

  @Column({ name: 'topline_id', nullable: true })
  topline_id: string;

  @Column({ name: 'updated_time', type: 'timestamptz', nullable: true })
  updated_time: Date;

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
