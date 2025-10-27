// src/modules/pages/entities/page.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique, Index } from 'typeorm';

@Entity('pages')
@Unique(['title']) // Only title needs to be unique globally
@Unique(['parentId', 'url']) // URL should be unique per parent
export class Page {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  title: string;

  @Column()
  @Index()
  url: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ default: 'general' })
  type: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  // Self-referencing relationship
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

// // src/modules/pages/entities/page.entity.ts
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';

// @Entity('pages')
// @Unique(['parentId', 'url'])
// @Unique(['title'])
// @Unique(['url'])
// export class Page {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   title: string;

//   @Column()
//   url: string;

//   @Column({ type: 'text', nullable: true })
//   content?: string;

//   @Column({ default: 'general' })
//   type: string; // home, blog, service, etc.

//   @Column({ default: 0 })
//   order: number;

//   @Column({ default: true })
//   isActive: boolean;

//   @Column({ nullable: true })
//   metaTitle?: string;

//   @Column({ nullable: true })
//   metaDescription?: string;

//   // Self-referencing relationship for nested navbar
//   @ManyToOne(() => Page, (page) => page.children, { nullable: true, onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'parentId' })
//   parent?: Page;

//   @Column({ nullable: true })
//   parentId?: number;

//   @OneToMany(() => Page, (page) => page.parent)
//   children?: Page[];
// }
