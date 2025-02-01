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
import { Campaign } from './campaign.entity';
import { Ad } from './ad.entity';
import { Insight } from './insight.entity';

@Entity('ad_sets')
export class AdSet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  adset_meta_id: string; // ID dari Meta API (tidak boleh null)

  @Column()
  name: string; // Nama (tidak boleh null)

  @Column({ nullable: true })
  account_id: string;

  @Column({ nullable: true })
  contextual_bundling_spec: string;

  @Column({ nullable: true })
  configured_status: string;

  @Column({ nullable: true })
  campaign_id: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.adSets)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Column({ nullable: true })
  campaign_attribution: string;

  @Column({ nullable: true })
  campaign_active_time: string;

  @Column({ nullable: true })
  budget_remaining: string;

  @Column({ nullable: true })
  brand_safety_config: string;

  @Column({ nullable: true })
  billing_event: string;

  @Column({ nullable: true })
  bid_strategy: string;

  @Column({ nullable: true })
  bid_info: string;

  @Column({ nullable: true })
  bid_constraints: string;

  @Column({ nullable: true })
  bid_amount: string;

  @Column({ nullable: true })
  bid_adjustments: string;

  @Column({ nullable: true })
  attribution_spec: string;

  @Column({ nullable: true })
  asset_feed_id: string;

  @Column({ nullable: true })
  adset_schedule: string;

  @Column({ nullable: true })
  time_based_ad_rotation_intervals: string;

  @Column({ nullable: true })
  targeting_optimization_types: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  source_adset_id: string;

  @Column({ nullable: true })
  rf_prediction_id: string;

  @Column({ nullable: true })
  regional_regulation_identities: string;

  @Column({ nullable: true })
  recurring_budget_semantics: string;

  @Column({ nullable: true })
  promoted_object: string;

  @Column({ nullable: true })
  targeting: string;

  @Column({ nullable: true })
  source_adset: string;

  @Column({ nullable: true })
  regional_regulated_categories: string;

  @Column({ nullable: true })
  recommendations: string;

  @Column({ nullable: true })
  pacing_type: string;

  @Column({ nullable: true })
  optimization_sub_event: string;

  @Column({ nullable: true })
  optimization_goal: string;

  @Column({ nullable: true })
  multi_optimization_goal_weight: string;

  @Column({ nullable: true })
  min_budget_spend_percentage: string;

  @Column({ nullable: true })
  lifetime_spend_cap: string;

  @Column({ nullable: true })
  lifetime_min_spend_target: string;

  @Column({ nullable: true })
  lifetime_imps: string;

  @Column({ nullable: true })
  lifetime_budget: string;

  @Column({ nullable: true })
  learning_stage_info: string;

  @Column({ nullable: true })
  issues_info: string;

  @Column({ nullable: true })
  is_dynamic_creative: boolean;

  @Column({ nullable: true })
  frequency_control_specs: string;

  @Column({ nullable: true })
  end_time: string;

  @Column({ nullable: true })
  effective_status: string;

  @Column({ nullable: true })
  dsa_payor: string;

  @Column({ nullable: true })
  dsa_beneficiary: string;

  @Column({ nullable: true })
  destination_type: string;

  @Column({ nullable: true })
  daily_spend_cap: string;

  @Column({ nullable: true })
  daily_min_spend_target: string;

  @Column({ nullable: true })
  daily_budget: string;

  @Column({ nullable: true })
  review_feedback: string;

  @Column({ nullable: true })
  start_time: string;

  @Column({ nullable: true })
  time_based_ad_rotation_id_blocks: string;

  @Column({ nullable: true })
  updated_time: string;

  @Column({ nullable: true })
  use_new_app_click: boolean;

  @Column({ nullable: true })
  adlabels: string;

  @Column({ nullable: true })
  created_time: string;

  @OneToMany(() => Ad, (ad) => ad.adSet)
  ads: Ad[];

  @OneToMany(() => Insight, (insight) => insight.referenceId)
  insights: Insight[];

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
