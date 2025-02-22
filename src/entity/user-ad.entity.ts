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

import { UserAdsets } from './user-adset.entity';
import { User } from './user.entity';
import { UserDashboard } from './user-dashboard.entity';
import { Exclude } from 'class-transformer';
import { Ad } from './ad.entity';

@Entity()
export class UserAd {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.user_ads)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => UserAdsets, (userAdset) => userAdset.user_ads)
  @JoinColumn({ name: 'adset_id' })
  user_adset_id: UserAdsets;

  @ManyToOne(() => Ad, (ad) => ad.user_ads)
  @JoinColumn({ name: 'meta_ad_id' })
  meta_ad_id: Ad;

  @OneToMany(() => UserDashboard, (userDashboard) => userDashboard.user_ad_id)
  dashboards: UserDashboard[];

  @Column()
  name: string;

  @Column({ nullable: true })
  budget: number;

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
