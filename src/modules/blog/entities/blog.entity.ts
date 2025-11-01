// src/modules/blog/entities/blog.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Page } from 'src/modules/pages/entities/page.entity';
import { Category } from 'src/modules/categories/entities/category.entity';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ type: 'text' })
  subtitle: string;

  @Column({ type: 'text' })
  content: string; // main body HTML

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'json', nullable: true })
  metaData?: any;

  @Column({ nullable: true })
  authorName?: string;

  @Column({ nullable: true })
  status?: string; // published, draft

  @Column({ default: false })
  featured?: boolean;

  @Column({ type: 'int', nullable: true })
  readingTime?: number;

  @ManyToOne(() => Page, (page) => page.blogs, { eager: true })
  page: Page;

  @ManyToOne(() => Category, (category) => category.blogs, { eager: true })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
