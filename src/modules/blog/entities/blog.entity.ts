import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Page } from 'src/modules/pages/entities/page.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { BlogType } from '../enum/blog-type.enum';
import { Tag } from 'src/modules/tag/entities/tag.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  subtitle?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  keyTakeaways?: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  thumbnailAltText?: string;

  @Column({ type: 'simple-array', nullable: true })
  image?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metaData?: any;

  // Promotional Data
  @Column({ type: 'jsonb', nullable: true })
  promotionalData?: {
    title: string;
    keywords: string[];
    promotional_url: string;
    image?: string;
  };

  // FAQ Data
  @Column({ type: 'jsonb', nullable: true })
  faqData?: {
    faqTitle: string;
    items: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };

  @Column({ type: 'int', nullable: true })
  readingTime?: number;

  @Column({ type: 'int', nullable: true })
  wordCount?: number;

  @Column({ default: false })
  featured?: boolean;

  @Column({ type: 'enum', enum: BlogType, nullable: true })
  blogType?: BlogType;

  @Column({ type: 'boolean', default: true, nullable: false })
  status: boolean;

  @ManyToOne(() => Page, (page) => page.blogs, { eager: true })
  page: Page;

  @ManyToOne(() => Category, (category) => category.blogs, { eager: true })
  category: Category;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => User, { eager: true })
  @JoinTable()
  authors: User[];

  @ManyToOne(() => User, { nullable: true, eager: true })
  createdBy?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
