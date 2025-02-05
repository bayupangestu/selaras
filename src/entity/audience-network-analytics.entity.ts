import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { AdAccount } from './ad-account.entity';

@Entity('audience_network_analytics')
export class AudienceNetworkAnalytics extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  metric: string;

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.analytics)
  @JoinColumn({ name: 'ad_account_id' })
  adAccount: AdAccount;

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
