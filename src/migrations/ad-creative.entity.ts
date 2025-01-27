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
  JoinColumn
} from 'typeorm';
import { Ad } from './ad.entity';

@Entity('ad_creatives')
export class AdCreative extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  creativeName: string;

  @ManyToOne(() => Ad, (ad) => ad.id)
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;

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
