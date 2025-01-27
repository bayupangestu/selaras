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
import { Campaign } from './campaign.entity';
import { Ad } from './ad.entity';
import { Insight } from './insight.entity';

@Entity('ad_sets')
export class AdSet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Campaign, (campaign) => campaign.adSets)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @OneToMany(() => Ad, (ad) => ad.adSet)
  ads: Ad[];

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
