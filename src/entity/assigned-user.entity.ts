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

@Entity('assigned_users')
export class AssignedUser extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  userName: string;

  @ManyToOne(() => AdAccount, (adAccount) => adAccount.assignedUsers)
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
