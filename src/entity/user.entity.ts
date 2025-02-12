import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { AdAccount } from './ad-account.entity';
import { Campaign } from './campaign.entity';
import { AdSet } from './ad-set.entity';
import { Ad } from './ad.entity';
import { Role } from './role.entity';
import { UserCampaign } from './user-campaign.entity';
import { UserAdsets } from './user-adset.entity';
import { UserAd } from './user-ad.entity';
import { UserDashboard } from './user-dashboard.entity';
import { UserProject } from './user-project.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => Role, (role) => role.user)
  @JoinColumn({ name: 'role_id' })
  role_id: Role;

  @Column({ type: 'varchar' })
  public email!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  public password!: string;

  @Column({ type: 'varchar', nullable: true })
  public name: string | null;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  public last_login_at: Date | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  public access_token: string;

  @Column({ type: 'timestamptz', nullable: true })
  start_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_at: Date;

  @OneToMany(() => AdAccount, (adaccount) => adaccount.user_id)
  adaccount: AdAccount[];

  @OneToMany(() => Campaign, (campaign) => campaign.user_id)
  campaign: Campaign[];

  @OneToMany(() => AdSet, (adset) => adset.user_id)
  adSet: AdSet[];

  @OneToMany(() => Ad, (ad) => ad.user_id)
  ad: Ad[];

  @OneToMany(() => UserCampaign, (userCampaign) => userCampaign.user_id)
  user_campaigns: UserCampaign[];

  @OneToMany(() => UserAdsets, (userAdset) => userAdset.user_id)
  user_adsets: UserAdsets[];

  @OneToMany(() => UserAd, (userAd) => userAd.user_id)
  user_ads: UserAd[];

  @OneToMany(() => UserDashboard, (userDashboard) => userDashboard.user_id)
  dashboards: UserDashboard[];

  @OneToMany(() => UserProject, (userProject) => userProject.user_id)
  user_projects: UserProject[];

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
