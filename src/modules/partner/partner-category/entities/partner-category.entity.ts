// src/modules/partner-categories/entities/partner-category.entity.ts
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Partner } from '../../partner/entities/partner.entity';

@Entity('partner_categories')
@Unique(['slug'])
export class PartnerCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  status: boolean;

  @OneToMany(() => Partner, (partner) => partner.category)
  partners: Partner[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
