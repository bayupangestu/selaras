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

@Entity()
export class DashboardAttributeVisibility {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserCampaign, (campaign) => campaign.attributeVisibilities)
  @JoinColumn({ name: 'campaign_id' })
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
