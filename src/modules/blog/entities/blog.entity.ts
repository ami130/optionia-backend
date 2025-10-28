// src/modules/blog/entities/blog.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('blogs')
@Unique(['title'])
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  image?: string;

  // @ManyToOne(() => User, (user) => user.blogs, { eager: true })
  // author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// import { User } from 'src/users/entities/user.entity';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   Index,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   Unique,
//   UpdateDateColumn,
// } from 'typeorm';

// @Index(['title', 'description'])
// @Entity('blogs')
// @Unique(['title'])
// export class Blog {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   title: string;

//   @ManyToOne(() => User, (user) => user.blogs)
//   @JoinColumn({ name: 'author_id' })
//   author: User;

//   @Column('text')
//   description: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @Column()
//   image: string;

//   @Column({ default: 'published' })
//   status: string;
// }
