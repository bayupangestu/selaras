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
import { AdSet } from './ad-set.entity';
import { AdCreative } from './ad-creative.entity';
import { Insight } from './insight.entity';
import { User } from './user.entity';
import { Campaign } from './campaign.entity';
import { UserAd } from './user-ad.entity';
import { UserDashboard } from './user-dashboard.entity';

@Entity('ads')
export class Ad extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.ad)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  creative: string;

  @Column({ nullable: true, type: 'timestamptz' })
  created_time: Date;

  @Column({ nullable: true })
  conversion_domain: string;

  @Column({ nullable: true })
  configured_status: string;

  @Column({ nullable: true })
  campaign_meta_id: string;

  @Column({ nullable: true })
  campaign: string;

  @Column({ nullable: true, type: 'float' })
  bid_amount: number;

  @Column({ nullable: true })
  adset_id: string;

  @ManyToOne(() => AdSet, (adSet) => adSet.ads)
  @JoinColumn({ name: 'ad_set_id' })
  ad_set_id: AdSet;

  @ManyToOne(() => Campaign, (campaign) => campaign.ads)
  @JoinColumn({ name: 'campaign_id' })
  campaign_id: Campaign;

  @Column({ nullable: true })
  adset: string;

  @Column({ nullable: true, type: 'jsonb' })
  adlabels: object;

  @Column({ nullable: true, type: 'timestamptz' })
  ad_schedule_start_time: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  ad_schedule_end_time: Date;

  @Column({ nullable: true, type: 'jsonb' })
  ad_review_feedback: object;

  @Column({ nullable: true, type: 'jsonb' })
  ad_active_time: object;

  @Column({ nullable: true })
  account_id: string;

  @Column({ nullable: true, type: 'jsonb' })
  tracking_specs: object;

  @Column({ nullable: true })
  source_ad_id: string;

  @Column({ nullable: true, type: 'jsonb' })
  source_ad: object;

  @Column({ nullable: true, type: 'jsonb' })
  recommendations: object;

  @Column({ nullable: true })
  preview_shareable_link: string;

  @Column({ nullable: true })
  last_updated_by_app_id: string;

  @Column({ nullable: true, type: 'jsonb' })
  issues_info: object;

  @Column({ nullable: true })
  effective_status: string;

  @Column({ nullable: true, type: 'jsonb' })
  creative_asset_groups_spec: object;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  ad_meta_id: string;

  @Column({ nullable: true, type: 'timestamptz' })
  updated_time: Date;

  @OneToMany(() => Insight, (insight) => insight.ad_id)
  insights: Insight[];

  @OneToMany(() => UserAd, (userAd) => userAd.meta_ad_id)
  user_ads: UserAd[];

  @OneToMany(() => UserDashboard, (userDashboard) => userDashboard.meta_ad_id)
  user_dashboards: UserDashboard[];

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
