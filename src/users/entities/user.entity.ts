import { BeforeUpdate, BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';
import { UserRole } from '../enum/userRole.enum';
import * as bcrypt from 'bcrypt';
import { Blog } from 'src/modules/blog/entities/blog.entity';
import { Exclude } from 'class-transformer';
import { Review } from 'src/modules/review/entities/review.entity';

@Entity('users')
@Unique(['email'])
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

  @OneToMany(() => Review, (review) => review.user, { eager: true, cascade: true })
  reviews: Review[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
