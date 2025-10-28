import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoleModulePermission } from '../role-module-permission/role-module-permission.entity';

@Entity('modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @OneToMany(() => RoleModulePermission, (rmp) => rmp.module)
  roleModulePermissions: RoleModulePermission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
