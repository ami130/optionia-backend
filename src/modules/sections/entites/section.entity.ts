import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SectionItem } from './section-item.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ name: 'background_image', nullable: true })
  backgroundImage?: string;

  @Column({ name: 'content_alignment', default: 'left' })
  contentAlignment: string;

  @Column({ name: 'background_color', nullable: true })
  backgroundColor?: string;

  @Column({ name: 'text_color', nullable: true })
  textColor?: string;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'key_points', type: 'json', nullable: true })
  keyPoints?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => SectionItem, (item) => item.section, {
    cascade: true,
    eager: true,
  })
  contents: SectionItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
