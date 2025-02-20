import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  AfterInsert,
  ManyToOne,
  JoinColumn,
  AfterUpdate,
  BeforeInsert,
  OneToMany
} from 'typeorm';
import { Insight } from './insight.entity';
import { UserDashboard } from './user-dashboard.entity';

@Entity('insight_breakdown')
export class InsightBreakdown extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Insight, (insight) => insight.insight_breakdown_id)
  insights: Insight[];

  @OneToMany(
    () => UserDashboard,
    (userDashboard) => userDashboard.insight_breakdown_id
  )
  user_dashboards: UserDashboard[];

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column({ type: 'varchar', nullable: true })
  age: string;

  @Column({ type: 'varchar', nullable: true })
  country: string;

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'varchar', nullable: true })
  publisher_platform: string;

  @Column({ type: 'varchar', nullable: true })
  device_platform: string;

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
