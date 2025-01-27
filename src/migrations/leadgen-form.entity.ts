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
import { Page } from './page.entity';

@Entity('leadgen_forms')
export class LeadgenForm extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  formName: string;

  @ManyToOne(() => Page, (page) => page.leadgenForms)
  @JoinColumn({ name: 'page_id' })
  page: Page;

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
