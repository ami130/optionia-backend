import { Page } from 'src/modules/pages/entities/page.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('terms_conditions')
export class TermsConditions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Page, (page) => page.termsOfService, { eager: true })
  @JoinColumn({ name: 'pageId' }) // Explicit column name
  page: Page;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
