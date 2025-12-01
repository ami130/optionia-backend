// src/modules/partners/entities/partner.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PartnerCategory } from '../../partner-category/entities/partner-category.entity';

@Entity('partners')
@Unique(['name'])
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  name: string;

  @Column({ length: 150, nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ length: 200, nullable: true })
  websiteLink: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => PartnerCategory, (category) => category.partners, {
    onDelete: 'SET NULL',
    eager: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: PartnerCategory;

  @Column({ nullable: true })
  categoryId: number;

  @Column('jsonb', { nullable: true })
  meta_data: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
