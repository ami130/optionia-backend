// src/modules/pricing/entities/pricing-plan.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PricingFeature } from './pricing-feature.entity';

@Entity('pricing_plans')
export class PricingPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_popular: boolean;

  @Column({ nullable: true })
  trial_days: number;

  @Column({ default: 'Get Started' })
  button_text: string;

  @Column()
  button_link: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monthly_price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  yearly_price: number;

  @Column({ nullable: true })
  discount_percentage: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: 0 })
  ordering: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => PricingFeature, (feature) => feature.plan, { cascade: true })
  features: PricingFeature[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
