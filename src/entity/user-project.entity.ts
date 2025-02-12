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
import { User } from './user.entity';
import { UserCampaign } from './user-campaign.entity';

@Entity()
export class UserProject extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'varchar' })
  public name: string;

  @ManyToOne(() => User, (user) => user.user_projects)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @OneToMany(() => UserCampaign, (userCampaign) => userCampaign.user_project_id)
  user_campaigns: UserCampaign[];

  @Exclude()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Exclude()
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at: Date;
}
