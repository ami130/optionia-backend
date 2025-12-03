import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PricingPlan } from './pricing-plan.entity';

@Entity('pricing_features')
export class PricingFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  ordering: number;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => PricingPlan, (plan) => plan.features, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'plan_id' })
  plan: PricingPlan;

  @Column({ nullable: true })
  plan_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
