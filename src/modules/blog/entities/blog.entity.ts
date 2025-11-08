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

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'simple-array', nullable: true }) // array of image URLs
  image?: string[];

  @Column({ type: 'jsonb', nullable: true }) // store metaData as JSON in Postgres
  metaData?: any;

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

  // ✅ Relations
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
