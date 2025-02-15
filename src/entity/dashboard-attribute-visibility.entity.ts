import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany
} from 'typeorm';
import { UserCampaign } from './user-campaign.entity';
import { UserDashboard } from './user-dashboard.entity';
import { UserAdsets } from './user-adset.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class DashboardAttributeVisibility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserCampaign,
    (userCampaign) => userCampaign.attributeVisibilities
  )
  @JoinColumn({ name: 'user_campaign_id' })
  user_campaign_id: UserCampaign;

  @OneToMany(
    () => UserDashboard,
    (userDashboard) => userDashboard.dashboard_attribute_visibility_id
  )
  user_dashboards: UserDashboard[];

  @Column({ type: 'json' })
  attribute_name: string[];

  @Column({ default: true })
  is_visible: boolean;

  @Exclude()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn()
  deleted_at: Date;
}
