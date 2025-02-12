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
import { UserCampaign } from './user-campaign.entity';
import { UserDashboard } from './user-dashboard.entity';
import { UserAdsets } from './user-adset.entity';

@Entity()
export class DashboardAttributeVisibility {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => UserCampaign,
    (userCampaign) => userCampaign.attributeVisibilities
  )
  @JoinColumn({ name: 'user_campaign_id' })
  user_campaign_id: UserCampaign;

  @Column()
  attribute_name: string;

  @Column({ default: true })
  is_visible: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
