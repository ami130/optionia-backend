// src/modules/pages/entities/page.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Blog } from '../../blog/entities/blog.entity';
import { slugify } from 'src/common/config/slugify';
import { TermsConditions } from 'src/modules/terms-conditions/entities/terms-conditions.entity';
import { PrivacyPolicy } from 'src/modules/privacy-policy/entities/privacy-policy.entity'; // Correct import

@Entity('pages')
@Unique(['title'])
@Unique(['parentId', 'url'])
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: 'general' })
  @Index()
  name: string;

  @Column({ unique: true, nullable: false })
  @Index()
  slug: string;

  @Column()
  @Index()
  title: string;

  @Column()
  @Index()
  url: string;

  @Column({ type: 'text', nullable: true })
  subtitle?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  navbarShow: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'general' })
  type: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @Column('simple-array', { nullable: true })
  metaKeywords?: string[];

  @Column({ nullable: true })
  canonicalUrl?: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column({ nullable: true })
  textColor?: string;

  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ type: 'varchar', nullable: true })
  metaImage?: string;

  @Column({ type: 'json', nullable: true })
  metaData?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };

  @ManyToOne(() => Page, (page) => page.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Page;

  @Column({ nullable: true })
  parentId?: number;

  @OneToMany(() => Page, (page) => page.parent, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  children?: Page[];

  @OneToMany(() => Blog, (blog) => blog.page, { cascade: true })
  blogs?: Blog[];

  @OneToMany(() => TermsConditions, (term) => term.page, { cascade: true })
  termsOfService?: TermsConditions[];

  @OneToMany('PrivacyPolicy', (policy: any) => policy.page, { cascade: true })
  privacyPolicies?: any; // Fixed spelling

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateSlugAndUrl() {
    if (this.title && !this.slug) {
      this.slug = slugify(this.title);
    }
    if (this.slug && !this.url) {
      this.url = `/${this.slug}`;
    }
  }
}
