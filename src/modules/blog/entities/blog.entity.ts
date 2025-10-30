// src/modules/blog/entities/blog.entity.ts
import { Category } from 'src/modules/categories/entities/category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

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

  @ManyToOne(()=>Category, (category)=> category.blogs, {eager:true})
  category:Category

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
