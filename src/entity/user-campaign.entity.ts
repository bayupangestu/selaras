import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
import { UserAdsets } from './user-adset.entity';
import { Platform } from './platform.entity';
import { UserDashboard } from './user-dashboard.entity';
import { DashboardAttributeVisibility } from './dashboard-attribute-visibility.entity';
import { Campaign } from './campaign.entity';
import { CampaignType } from './campaign-type.entity';
import { UserProject } from './user-project.entity';

@Entity()
export class UserCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.user_campaigns)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => Platform, (platform) => platform.user_campaigns)
  @JoinColumn({ name: 'platform_id' })
  platform_id: Platform;

  @ManyToOne(() => Campaign, (campaign) => campaign.user_campaigns)
  @JoinColumn({ name: 'meta_campaign_id' })
  meta_campaign_id: Campaign;

  // @ManyToOne(() => GoogleCampaign, (googleCampaign) => googleCampaign.user_campaigns)
  // @JoinColumn({ name: 'google_campaign_id' })
  // google_campaign_id: Campaign;

  @ManyToOne(() => CampaignType, (campaignType) => campaignType.user_campaign)
  @JoinColumn({ name: 'campaign_type_id' })
  campaign_type_id: CampaignType;

  @ManyToOne(() => UserProject, (userProject) => userProject.user_campaigns)
  @JoinColumn({ name: 'user_project_id' })
  user_project_id: UserProject;

  @Column()
  name: string;

  @Column({ nullable: true })
  budget: number;

  @OneToMany(() => UserAdsets, (userAdset) => userAdset.user_campaign_id)
  user_adsets: UserAdsets[];

  @OneToMany(
    () => UserDashboard,
    (userDashboard) => userDashboard.user_campaign_id
  )
  dashboards: UserDashboard[];

  @OneToMany(
    () => DashboardAttributeVisibility,
    (dashboardAttribute) => dashboardAttribute.user_campaign_id
  )
  attributeVisibilities: DashboardAttributeVisibility[];

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
