// src/roles/entities/role.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from '../permission.entity/permission.entity';
import { RoleModulePermission } from '../role-module-permission/role-module-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToMany(() => Permission, (p) => p.roles, { eager: false })
  permissions: Permission[];

  @OneToMany(() => User, (u) => u.role)
  users: User[];

  @OneToMany(() => RoleModulePermission, (rmp) => rmp.role, { cascade: true })
  roleModulePermissions: RoleModulePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}




// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity('roles')
// export class Role {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   name: string;

//   @Column({ unique: true })
//   slug: string;
// }




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
