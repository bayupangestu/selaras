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

import { UserCampaign } from './user-campaign.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
import { UserAd } from './user-ad.entity';
import { UserDashboard } from './user-dashboard.entity';
import { AdSet } from './ad-set.entity';

@Entity()
export class UserAdsets {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserCampaign, (campaign) => campaign.user_adsets)
  @JoinColumn({ name: 'user_campaign_id' })
  user_campaign_id: UserCampaign;

  @ManyToOne(() => AdSet, (adSet) => adSet.user_adsets)
  @JoinColumn({ name: 'meta_adset_id' })
  meta_adset_id: AdSet;

  @ManyToOne(() => User, (user) => user.user_adsets)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column()
  name: string;

  @OneToMany(() => UserAd, (userAd) => userAd.user_adset_id)
  user_ads: UserAd[];

  @OneToMany(
    () => UserDashboard,
    (userDashboard) => userDashboard.user_adset_id
  )
  dashboards: UserDashboard[];

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
