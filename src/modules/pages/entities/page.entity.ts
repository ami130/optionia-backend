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

  // ✅ Add these fields that are missing
  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @Column('simple-array', { nullable: true })
  metaKeywords?: string[];

  @Column({ nullable: true })
  canonicalUrl?: string;

  @Column({ type: 'json', nullable: true })
  metaImage?: { url: string; alt?: string };

  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column({ nullable: true })
  textColor?: string;

  // ✅ Add metaData field as JSON (if you want to use it)
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    // If slug is not provided or empty, generate from title
    if (!this.slug || this.slug.trim() === '') {
      this.slug = slugify(this.title);
    } else {
      // If slug is provided, ensure it's properly slugified
      this.slug = slugify(this.slug);
    }

    // Ensure slug is not empty (fallback)
    if (!this.slug || this.slug.trim() === '') {
      this.slug = slugify(this.name || 'page');
    }
  }
}

// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   ManyToOne,
//   OneToMany,
//   JoinColumn,
//   Unique,
//   Index,
//   CreateDateColumn,
//   UpdateDateColumn,
//   BeforeInsert,
//   BeforeUpdate,
// } from 'typeorm';
// import { Blog } from '../../blog/entities/blog.entity';
// import { slugify } from 'src/common/config/slugify'; // Make sure you have slugify

// @Entity('pages')
// @Unique(['title'])
// @Unique(['parentId', 'url'])
// export class Page {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ nullable: false, default: 'general' })
//   @Index()
//   name: string;

//   @Column({ unique: true, nullable: false })
//   @Index()
//   slug: string;

//   @Column()
//   @Index()
//   title: string;

//   @Column()
//   @Index()
//   url: string;

//   @Column({ type: 'text', nullable: true })
//   subtitle?: string;

//   @Column({ type: 'text', nullable: true })
//   description?: string;

//   @Column({ default: true })
//   navbarShow: boolean;

//   @Column({ type: 'int', default: 0 })
//   order: number;

//   @Column({ default: true })
//   isActive: boolean;

//   @Column({ default: 'general' })
//   type: string;

//   @Column({ type: 'text', nullable: true })
//   content?: string;

//   @Column({ nullable: true })
//   metaTitle?: string;

//   @Column({ type: 'text', nullable: true })
//   metaDescription?: string;

//   @Column('simple-array', { nullable: true })
//   metaKeywords?: string[];

//   @Column({ nullable: true })
//   canonicalUrl?: string;

//   @Column({ type: 'json', nullable: true })
//   metaImage?: { url: string; alt?: string };

//   @Column({ nullable: true })
//   backgroundImage?: string;

//   @Column({ nullable: true })
//   backgroundColor?: string;

//   @Column({ nullable: true })
//   textColor?: string;

//   @ManyToOne(() => Page, (page) => page.children, {
//     nullable: true,
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'parentId' })
//   parent?: Page;

//   @Column({ nullable: true })
//   parentId?: number;

//   @OneToMany(() => Page, (page) => page.parent, {
//     cascade: true,
//     onDelete: 'CASCADE',
//   })
//   children?: Page[];

//   @OneToMany(() => Blog, (blog) => blog.page, { cascade: true })
//   blogs?: Blog[];

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @BeforeInsert()
//   @BeforeUpdate()
//   generateSlug() {
//     // If slug is not provided or empty, generate from title
//     if (!this.slug || this.slug.trim() === '') {
//       this.slug = slugify(this.title);
//     } else {
//       // If slug is provided, ensure it's properly slugified
//       this.slug = slugify(this.slug);
//     }

//     // Ensure slug is not empty (fallback)
//     if (!this.slug || this.slug.trim() === '') {
//       this.slug = slugify(this.name || 'page');
//     }
//   }
// }
