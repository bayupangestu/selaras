import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { CustomAudience } from './custom-audience.entity';
import { AudienceNetworkAnalytics } from './audience-network-analytics.entity';
import { AssignedUser } from './assigned-user.entity';
import { Insight } from './insight.entity';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity('ad_accounts')
export class AdAccount {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, (user) => user.adaccount)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  account_id: string;

  @Column({ nullable: true })
  account_status: number;

  @Column({ type: 'float', nullable: true })
  age: number;

  @Column({ type: 'json', nullable: true })
  agency_client_declaration: object;

  @Column({ nullable: true })
  amount_spent: string;

  @Column({ nullable: true })
  balance: string;

  @Column({ type: 'json', nullable: true })
  business: object;

  @Column({ nullable: true })
  business_country_code: string;

  @Column({ nullable: true })
  business_city: string;

  @Column({ nullable: true })
  business_name: string;

  @Column({ nullable: true })
  business_street: string;

  @Column({ nullable: true })
  business_street2: string;

  @Column({ nullable: true })
  can_create_brand_lift_study: boolean;

  @Column({ type: 'json', nullable: true })
  capabilities: object;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  created_time: string;

  @Column({ nullable: true })
  disable_reason: number;

  @Column({ type: 'json', nullable: true })
  funding_source_details: object;

  @Column({ nullable: true })
  has_migrated_permissions: boolean;

  @Column({ nullable: true })
  fb_entity: number;

  @Column({ type: 'json', nullable: true })
  expired_funding_source_details: object;

  @Column({ nullable: true })
  funding_source: string;

  @Column({ nullable: true })
  is_attribution_spec_system_default: boolean;

  @Column({ nullable: true })
  is_direct_deals_enabled: boolean;

  @Column({ nullable: true })
  is_in_3ds_authorization_enabled_market: boolean;

  @Column({ nullable: true })
  is_notifications_enabled: boolean;

  @Column({ nullable: true })
  is_personal: number;

  @Column({ nullable: true })
  is_prepay_account: boolean;

  @Column({ nullable: true })
  is_tax_id_required: boolean;

  @Column({ nullable: true })
  min_campaign_group_spend_cap: string;

  @Column({ nullable: true })
  min_daily_budget: number;

  @Column({ nullable: true })
  offsite_pixels_tos_accepted: boolean;

  @Column({ nullable: true })
  owner: string;

  @Column({ type: 'json', nullable: true })
  rf_spec: object;

  @Column({ nullable: true })
  spend_cap: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ nullable: true })
  tax_id_status: number;

  @Column({ nullable: true })
  tax_id_type: string;

  @Column({ nullable: true })
  timezone_id: number;

  @Column({ nullable: true })
  timezone_name: string;

  @Column({ nullable: true })
  timezone_offset_hours_utc: number;

  @Column({ nullable: true })
  end_advertiser: string;

  @Column({ nullable: true })
  end_advertiser_name: string;

  @Column({ nullable: true })
  business_state: string;

  @Column({ nullable: true })
  business_zip: string;

  @Column({ nullable: true })
  default_dsa_beneficiary: string;

  @Column({ nullable: true })
  default_dsa_payor: string;

  @Column({ type: 'json', nullable: true })
  tos_accepted: object;

  @Column({ type: 'json', nullable: true })
  user_tasks: object;

  @Column({ type: 'json', nullable: true })
  failed_delivery_checks: object;

  @OneToMany(() => Campaign, (campaign) => campaign.ad_account)
  campaigns: Campaign[];

  @OneToMany(() => AudienceNetworkAnalytics, (analytics) => analytics.adAccount)
  analytics: AudienceNetworkAnalytics[];

  @OneToMany(() => AssignedUser, (user) => user.adAccount)
  assignedUsers: AssignedUser[];

  @OneToMany(() => Insight, (insight) => insight.ad_account_id)
  insights: Insight[];

  @OneToMany(
    () => CustomAudience,
    (custom_audiance) => custom_audiance.ad_account_id
  )
  custom_audiances: CustomAudience[];

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
