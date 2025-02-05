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
import { Exclude } from 'class-transformer';
import { AdAccount } from './ad-account.entity';

@Entity('custom_audiences')
export class CustomAudience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.custom_audiances)
  @JoinColumn({ name: 'ad_account_id' })
  ad_account_id: AdAccount;

  @Column({ nullable: true })
  data_source: string;

  @Column({ nullable: true })
  customer_file_source: string;

  @Column({ type: 'int', nullable: true })
  approximate_count_upper_bound: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  approximate_count_lower_bound: number;

  @Column({ type: 'timestamptz', nullable: true })
  time_created: Date;

  @Column({ nullable: true })
  subtype: string;

  @Column({ type: 'json', nullable: true })
  rule_aggregation: object;

  @Column({ type: 'json', nullable: true })
  rule: object;

  @Column({ type: 'int', nullable: true })
  retention_days: number;

  @Column({ nullable: true })
  pixel_id: string;

  @Column({ type: 'json', nullable: true })
  permission_for_actions: object;

  @Column({ type: 'timestamptz', nullable: true })
  page_deletion_marked_delete_time: Date;

  @Column({ nullable: true })
  opt_out_link: string;

  @Column({ type: 'json', nullable: true })
  operation_status: object;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'json', nullable: true })
  lookalike_spec: object;

  @Column({ type: 'json', nullable: true })
  lookalike_audience_ids: object;

  @Column({ type: 'boolean', nullable: true })
  is_value_based: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  time_updated: Date;

  @Column({ type: 'integer', nullable: true })
  time_content_updated: number;

  @Column({ type: 'json', nullable: true })
  sharing_status: object;

  @Column({ type: 'json', nullable: true })
  delivery_status: object;

  @Column({ type: 'varchar', nullable: true })
  audience_meta_id: string;

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
