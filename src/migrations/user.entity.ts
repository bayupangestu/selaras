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

  @OneToMany(() => AdAccount, (adaccount) => adaccount.user_id)
  adaccount: AdAccount[];

  @OneToMany(() => Campaign, (campaign) => campaign.user_id)
  campaign: Campaign[];

  @OneToMany(() => AdSet, (adset) => adset.user_id)
  adSet: AdSet[];

  @OneToMany(() => Ad, (ad) => ad.user_id)
  ad: Ad[];

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
