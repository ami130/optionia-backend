import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Section } from './section.entity';

@Entity('section_items')
export class SectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Section, (section) => section.contents, { onDelete: 'CASCADE' })
  section: Section;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  keyPoints?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  // ✅ Multiple icons per item
  @Column({ type: 'json', nullable: true })
  icons?: {
    id: string;
    icon: string;
    text: string;
    color: string;
    bgColor: string;
  }[];

  // ✅ Multiple images per item
  @Column({ type: 'json', nullable: true })
  images?: string[];

  // ✅ Multiple buttons per item
  @Column({ type: 'json', nullable: true })
  buttons?: {
    link: string;
    text: string;
    bgColor?: string;
    textColor?: string;
  }[];

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
