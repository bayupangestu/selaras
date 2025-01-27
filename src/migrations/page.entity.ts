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
import { LeadgenForm } from './leadgen-form.entity';

@Entity('pages')
export class Page extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  pageName: string;

  @OneToMany(() => LeadgenForm, (form) => form.page)
  leadgenForms: LeadgenForm[];

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
