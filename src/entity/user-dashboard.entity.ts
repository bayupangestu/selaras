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

@Entity()
export class UserDashboard {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  time_period: string;

  @Column()
  reach: number;

  @Column()
  impression: number;

  @Column()
  clicks: number;

  @Column()
  ctr: number;

  @Column()
  post_engagement: number;

  @Column()
  views: number;

  @Column()
  thruplay: number;

  @Column()
  platform: string;

  @Column()
  demography: string;

  @Column()
  thumbnail_ads: string;

  @Column()
  leads: number;

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
