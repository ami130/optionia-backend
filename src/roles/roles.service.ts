// // src/roles/roles.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';
import { Role } from './entities/role.entity';
import { ModuleEntity } from './entities/module/module.entity';
import { Permission } from './entities/permission.entity/permission.entity';
import { RoleModulePermission } from './entities/role-module-permission/role-module-permission.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRolePermissionsBulkDto } from './dto/assign-role-permissions-bulk.dto';
import { CreateOrUpdateRoleWithPermissionsDto } from './dto/create-or-update-role-with-permissions.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(RoleModulePermission) private readonly rmpRepo: Repository<RoleModulePermission>,
    @InjectRepository(ModuleEntity) private readonly moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
  ) {}

  async createOrUpdateRoleWithPermissions(dto: CreateOrUpdateRoleWithPermissionsDto) {
    let role: any;

    if (dto.roleId) {
      role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      role.name = dto.name || role.name;
      // role.slug stays same
    } else {
      role = this.roleRepo.create({ name: dto.name, slug: dto.name.toLowerCase().replace(/\s+/g, '-') });
    }

    role = await this.roleRepo.save(role);

    // Clear existing permissions if updating
    if (dto.roleId) {
      await this.rmpRepo.delete({ role: { id: role.id } });
    }

    // Assign bulk permissions
    const results: { roleId: number; moduleId: number; permissionId: number }[] = [];

    for (const mod of dto.modules) {
      const moduleEntity = await this.moduleRepo.findOne({ where: { id: mod.moduleId } });
      if (!moduleEntity) throw new NotFoundException(`Module ${mod.moduleId} not found`);

      for (const permId of mod.permissionIds) {
        const permission = await this.permissionRepo.findOne({ where: { id: permId } });
        if (!permission) throw new NotFoundException(`Permission ${permId} not found`);

        const rmp = this.rmpRepo.create({ role, module: moduleEntity, permission });
        await this.rmpRepo.save(rmp);

        results.push({
          roleId: role.id,
          moduleId: moduleEntity.id,
          permissionId: permission.id,
        });
      }
    }

    return {
      success: true,
      message: dto.roleId ? 'Role updated with permissions' : 'Role created with permissions',
      data: {
        role: {
          id: role.id,
          name: role.name,
          slug: role.slug,
        },
        permissions: results,
      },
    };
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.roleRepo.findOne({ where: [{ name: dto.name }, { slug: dto.slug }] });
    if (exists) throw new ConflictException('Role exists');
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async findAllWithPermissions() {
    const roles = await this.roleRepo.find({
      relations: ['roleModulePermissions', 'roleModulePermissions.permission', 'roleModulePermissions.module'],
    });

    return roles.map((role) => {
      // Group permissions by module
      const moduleMap: Record<string, any> = {};

      for (const rmp of role.roleModulePermissions) {
        const moduleId = rmp.module.id;
        if (!moduleMap[moduleId]) {
          moduleMap[moduleId] = {
            module: {
              id: rmp.module.id,
              name: rmp.module.name,
              slug: rmp.module.slug,
              permissions: [],
            },
          };
        }

        moduleMap[moduleId].module.permissions.push({
          id: rmp.permission.id,
          name: rmp.permission.name,
          slug: rmp.permission.slug,
        });
      }

      return {
        id: role.id,
        name: role.name,
        slug: role.slug,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: Object.values(moduleMap).map((m) => m.module),
      };
    });
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    if (dto.name) role.name = dto.name;

    return this.roleRepo.save(role);
  }

  async assignPermissionsBulk(dto: AssignRolePermissionsBulkDto) {
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const results: { roleId: number; moduleId: number; permissionId: number }[] = [];

    for (const mod of dto.modules) {
      const moduleEntity = await this.moduleRepo.findOne({ where: { id: mod.moduleId } });
      if (!moduleEntity) throw new NotFoundException(`Module ${mod.moduleId} not found`);

      for (const permId of mod.permissionIds) {
        const permission = await this.permissionRepo.findOne({ where: { id: permId } });
        if (!permission) throw new NotFoundException(`Permission ${permId} not found`);

        // Check existing mapping
        let rmp = await this.rmpRepo.findOne({
          where: { role: { id: role.id }, module: { id: moduleEntity.id }, permission: { id: permission.id } },
        });

        // Create if not exists
        if (!rmp) {
          rmp = this.rmpRepo.create({ role, module: moduleEntity, permission });
          await this.rmpRepo.save(rmp);
        }

        results.push({
          roleId: role.id,
          moduleId: moduleEntity.id,
          permissionId: permission.id,
        });
      }
    }

    return {
      success: true,
      message: 'Permissions assigned/updated successfully',
      data: results,
    };
  }

  async assignPermission(dto: AssignRolePermissionDto) {
    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');
    const module = await this.moduleRepo.findOne({ where: { id: dto.moduleId } });
    if (!module) throw new NotFoundException('Module not found');
    const permission = await this.permissionRepo.findOne({ where: { id: dto.permissionId } });
    if (!permission) throw new NotFoundException('Permission not found');

    const existing = await this.rmpRepo.findOne({
      where: { role: { id: role.id }, module: { id: module.id }, permission: { id: permission.id } },
    });
    if (existing) return existing;

    const rmp = this.rmpRepo.create({ role, module, permission });
    return this.rmpRepo.save(rmp);
  }

  async getRoleModulesWithPermissions(roleId: number) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['roleModulePermissions', 'roleModulePermissions.permission', 'roleModulePermissions.module'],
    });

    if (!role) return null;

    // Create a map to group permissions by module
    const moduleMap: Record<string, any> = {};

    for (const rmp of role.roleModulePermissions) {
      const moduleId = rmp.module.id;
      if (!moduleMap[moduleId]) {
        moduleMap[moduleId] = {
          module: {
            id: rmp.module.id,
            name: rmp.module.name,
            slug: rmp.module.slug,
            permissions: [],
          },
        };
      }
      moduleMap[moduleId].module.permissions.push({
        id: rmp.permission.id,
        name: rmp.permission.name,
        slug: rmp.permission.slug,
        createdAt: rmp.permission.createdAt,
        updatedAt: rmp.permission.updatedAt,
      });
    }

    // Convert map to array
    return Object.values(moduleMap);
  }

  // UsersService or RolesService
  async assignAllPermissionsToAdmin(adminRoleSlug = 'admin') {
    const adminRole = await this.roleRepo.findOne({ where: { slug: adminRoleSlug } });
    if (!adminRole) return;

    const modules = await this.moduleRepo.find();
    const permissions = await this.permissionRepo.find();

    for (const mod of modules) {
      for (const perm of permissions) {
        const exists = await this.rmpRepo.findOne({
          where: { role: { id: adminRole.id }, module: { id: mod.id }, permission: { id: perm.id } },
        });
        if (!exists) {
          const rmp = this.rmpRepo.create({
            role: adminRole,
            module: mod,
            permission: perm,
          });
          await this.rmpRepo.save(rmp);
        }
      }
    }
  }

  async getRoleWithPermissions(roleId: number) {
    return this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['roleModulePermissions', 'roleModulePermissions.permission', 'roleModulePermissions.module'],
    });
  }

  // In RolesService class, add this method:
  async getAdminRole() {
    const adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }
    return adminRole;
  }
}
