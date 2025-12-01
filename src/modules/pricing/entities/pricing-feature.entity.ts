// src/modules/pricing/entities/pricing-feature.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

  @ManyToOne(() => PricingPlan, (plan) => plan.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PricingPlan;

  @Column()
  plan_id: number;
}
