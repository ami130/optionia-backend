import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity';

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

  @Column({ nullable: true })
  profileImage?: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true, length: 120 })
  bio?: string;

  @Column({ nullable: true })
  linkedinProfile?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    console.log('🔐 Entity - hashPassword called');
    console.log('🔐 Password before hash:', this.password?.substring(0, 10) + '...');

    // Only hash if password is modified and not already hashed
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
      console.log('🔐 Password after hash:', this.password.substring(0, 20) + '...');
    } else {
      console.log('🔐 Password already hashed or empty');
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    if (!attempt || !this.password) {
      return false;
    }

    try {
      return await bcrypt.compare(attempt, this.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }
}

// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   BeforeInsert,
//   BeforeUpdate,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   Unique,
//   JoinColumn,
// } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
// import { Role } from 'src/roles/entities/role.entity/role.entity';

// @Entity('users')
// @Unique(['email'])
// @Unique(['username'])
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   username: string;

//   @Column()
//   email: string;

//   @Exclude()
//   @Column()
//   password: string;

//   @Column({ nullable: true })
//   profileImage?: string;

//   @ManyToOne(() => Role, { eager: true })
//   @JoinColumn({ name: 'role_id' })
//   role: Role;

//   @Column({ nullable: true, length: 120 })
//   bio?: string;

//   @Column({ nullable: true })
//   linkedinProfile?: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   @BeforeInsert()
//   @BeforeUpdate()
//   async hashPassword() {
//     if (this.password) {
//       const saltRounds = 10;
//       this.password = await bcrypt.hash(this.password, saltRounds);
//     }
//   }

//   async comparePassword(attempt: string) {
//     if (!this.password) return false; // Prevent crash if no password saved
//     return bcrypt.compare(attempt, this.password);
//   }

//   // async comparePassword(attempt: string) {
//   //   return bcrypt.compare(attempt, this.password);
//   // }
// }
