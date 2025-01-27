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
import { Campaign } from './campaign.entity';
import { AdSet } from './ad-set.entity';
import { Ad } from './ad.entity';

@Entity('insights')
export class Insight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    type: 'enum',
    enum: ['ad_account', 'campaign', 'ad_set', 'ad']
  })
  referenceType: 'ad_account' | 'campaign' | 'ad_set' | 'ad';

  @Column({ type: 'int' })
  referenceId: number;

  @Column({ type: 'date' })
  dateStart: string;

  @Column({ type: 'date' })
  dateEnd: string;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'float', default: 0 })
  spend: number;

  @Column({ type: 'float', default: 0 })
  ctr: number;

  @Column({ type: 'float', default: 0 })
  cpc: number;

  @Column({ type: 'float', default: 0 })
  cpm: number;

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
