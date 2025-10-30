import { Blog } from 'src/modules/blog/entities/blog.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('categories')
@Unique(['slug'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Blog, (blog) => blog.category)
  blogs: Blog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
