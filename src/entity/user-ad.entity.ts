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
// import { Adsets } from '../adsets/entities/adsets.entity';
// import { User } from '../user/entities/user.entity';
import { UserAdsets } from './user-adset.entity';
import { User } from './user.entity';
import { UserDashboard } from './user-dashboard.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UserAd {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_ads)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => UserAdsets, (userAdset) => userAdset.user_ads)
  @JoinColumn({ name: 'adset_id' })
  user_adset_id: UserAdsets;

  @OneToMany(() => UserDashboard, (userDashboard) => userDashboard.user_ad_id)
  dashboards: UserDashboard[];

  @Column()
  name: string;

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
