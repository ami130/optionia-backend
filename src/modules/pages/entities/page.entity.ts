// // src/modules/pages/entities/page.entity.ts
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
} from 'typeorm';
import { Blog } from '../../blog/entities/blog.entity'; // example module
// import { Product } from '../../products/entities/product.entity'; // future module

@Entity('pages')
@Unique(['title'])
@Unique(['parentId', 'url'])
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, default: 'general' }) // safe for new rows, old rows updated manually
  @Index()
  name: string;
  // e.g., 'blog', 'product'

  @Column()
  @Index()
  title: string; // Display title

  @Column()
  @Index()
  url: string; // slug

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
  type: string; // blog, product, service

  // Optional content
  @Column({ type: 'text', nullable: true })
  content?: string;

  // SEO metadata
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

  // Styling
  @Column({ nullable: true })
  backgroundImage?: string;

  @Column({ nullable: true })
  backgroundColor?: string;

  @Column({ nullable: true })
  textColor?: string;

  // Self-referencing for nested pages
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

  // Example module relation
  @OneToMany(() => Blog, (blog) => blog.page, { cascade: true })
  blogs?: Blog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique, Index } from 'typeorm';

// @Entity('pages')
// @Unique(['title']) // Only title needs to be unique globally
// @Unique(['parentId', 'url']) // URL should be unique per parent
// export class Page {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   @Index()
//   title: string;

//   @Column()
//   @Index()
//   url: string;

//   @Column({ type: 'text', nullable: true })
//   content?: string;

//   @Column({ default: 'general' })
//   type: string;

//   @Column({ default: 0 })
//   order: number;

//   @Column({ default: true })
//   isActive: boolean;

//   @Column({ nullable: true })
//   metaTitle?: string;

//   @Column({ type: 'text', nullable: true })
//   metaDescription?: string;

//   // Self-referencing relationship
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

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   createdAt: Date;

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   updatedAt: Date;
// }
