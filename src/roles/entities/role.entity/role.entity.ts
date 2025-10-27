// src/roles/entities/role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}




// import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Permission } from '../permission.entity/permission.entity';

// @Entity('roles')
// export class Role {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   name: string;

//   @Column({ nullable: true })
//   description?: string;

//   @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
//   @JoinTable({
//     name: 'role_permissions',
//     joinColumn: { name: 'role_id', referencedColumnName: 'id' },
//     inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
//   })
//   permissions: Permission[];

//   @OneToMany(() => User, (user) => user.role)
//   users: User[];
// }
