import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Role } from '../role.entity';
import { ModuleEntity } from '../module/module.entity';
import { Permission } from '../permission.entity/permission.entity';

@Entity('role_module_permissions')
@Unique(['role', 'module', 'permission'])
export class RoleModulePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (r) => r.roleModulePermissions, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => ModuleEntity, (m) => m.roleModulePermissions, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module: ModuleEntity;

  @ManyToOne(() => Permission, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
