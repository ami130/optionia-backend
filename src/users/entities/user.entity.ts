import {
  BeforeUpdate,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Blog } from 'src/modules/blog/entities/blog.entity';
import { Exclude } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity/role.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ✅ This now handles the user's role
  // @ManyToOne(() => Role, (role) => role.users, { eager: true })
  // @JoinColumn({ name: 'roleId' })
  // role: Role;

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

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
