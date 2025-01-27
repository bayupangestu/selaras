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
import { AdSet } from './ad-set.entity';
import { AdCreative } from './ad-creative.entity';
import { Insight } from './insight.entity';

@Entity('ads')
export class Ad extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => AdSet, (adSet) => adSet.ads)
  @JoinColumn({ name: 'ad_set_id' })
  adSet: AdSet;

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
