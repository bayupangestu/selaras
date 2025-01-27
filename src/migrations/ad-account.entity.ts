import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { CustomAudience } from './custom-audience.entity';
import { AudienceNetworkAnalytics } from './audience-network-analytics.entity';
import { AssignedUser } from './assigned-user.entity';
import { Insight } from './insight.entity';
import { Exclude } from 'class-transformer';

@Entity('ad_accounts')
export class AdAccount {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Campaign, (campaign) => campaign.adAccount)
  campaigns: Campaign[];

  @OneToMany(() => CustomAudience, (audience) => audience.adAccount)
  customAudiences: CustomAudience[];

  @OneToMany(() => AudienceNetworkAnalytics, (analytics) => analytics.adAccount)
  analytics: AudienceNetworkAnalytics[];

  @OneToMany(() => AssignedUser, (user) => user.adAccount)
  assignedUsers: AssignedUser[];

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
