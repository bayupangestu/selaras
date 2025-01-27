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
import { AdSet } from './ad-set.entity';
import { Insight } from './insight.entity';

@Entity('campaigns')
export class Campaign extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.campaigns)
  @JoinColumn({ name: 'ad_account_id' })
  adAccount: AdAccount;

  @OneToMany(() => AdSet, (adSet) => adSet.campaign)
  adSets: AdSet[];

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
