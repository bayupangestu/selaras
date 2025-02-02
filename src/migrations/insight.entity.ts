import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

@Entity('insights')
export class Insight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Ubah tipe data dari `number` ke `string` karena menggunakan UUID

  @Column({ type: 'varchar' })
  reference_type: string;

  @Column({ type: 'varchar' })
  referenceId: string; // Ubah tipe data dari `any` ke `string`

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  impressions: number;

  @Column({ type: 'int', nullable: true })
  clicks: number;

  @Column({ type: 'float', nullable: true })
  spend: number;

  @Column({ type: 'float', nullable: true })
  ctr: number;

  @Column({ type: 'float', nullable: true })
  cpc: number;

  @Column({ type: 'float', nullable: true })
  cpm: number;

  @Column({ type: 'int', nullable: true })
  reach: number;

  @Column({ type: 'json', nullable: true })
  video_30_sec_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_avg_time_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_play_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  website_ctr: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_outbound_click: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_thruplay: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  cost_per_unique_action_type: { action_type: string; value: string }[];

  @Column({ type: 'float', nullable: true })
  cost_per_unique_click: number;

  @Column({ type: 'float', nullable: true })
  cost_per_unique_inline_link_click: number;

  @Column({ type: 'json', nullable: true })
  cost_per_unique_outbound_click: { action_type: string; value: string }[];

  @Column({ type: 'varchar', nullable: true })
  engagement_rate_ranking: string;

  @Column({ type: 'json', nullable: true })
  cost_per_action_type: { action_type: string; value: string }[];

  @Column({ type: 'float', nullable: true })
  cost_per_inline_post_engagement: number;

  @Column({ type: 'float', nullable: true })
  inline_link_click_ctr: number;

  @Column({ type: 'int', nullable: true })
  inline_link_clicks: number;

  @Column({ type: 'int', nullable: true })
  inline_post_engagement: number;

  @Column({ type: 'varchar', nullable: true })
  quality_ranking: string;

  @Column({ type: 'json', nullable: true })
  video_p100_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p25_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p50_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p75_watched_actions: { action_type: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  video_p95_watched_actions: { action_type: string; value: string }[];

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
