// src/roles/roles.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  // Create a new role with validation
  async create(name: string) {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Role name is required');
    }

    // Check for duplicate role name
    const existing = await this.roleRepo.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException(`Role '${name}' already exists`);
    }

    const role = this.roleRepo.create({ name: name.trim() });
    return this.roleRepo.save(role);
  }

  // Get all roles
  async findAll() {
    return this.roleRepo.find();
  }

  // Get one role by id
  async findOne(id: number) {
    if (!id) throw new BadRequestException('Role ID is required');

    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  // Update role
  async update(id: number, name: string) {
    if (!name || name.trim() === '') {
      throw new BadRequestException('Role name is required');
    }

    const role = await this.findOne(id);

    // Check for duplicate name
    const duplicate = await this.roleRepo.findOne({ where: { name } });
    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException(`Role '${name}' already exists`);
    }

    role.name = name.trim();
    return this.roleRepo.save(role);
  }

  // Delete role
  async remove(id: number) {
    const role = await this.findOne(id);
    return this.roleRepo.remove(role);
  }
}

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { User } from 'src/users/entities/user.entity';
// import { Role } from './entities/role.entity/role.entity';
// import { Permission } from './entities/permission.entity/permission.entity';
// import { AppModule } from 'src/app.module';

// @Injectable()
// export class RolesService {
//   constructor(
//     @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
//     @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
//     @InjectRepository(AppModule) private readonly moduleRepo: Repository<AppModule>,
//     @InjectRepository(User) private readonly userRepo: Repository<User>,
//   ) {}

//   // ----------------- MODULE CRUD -----------------
//   async createModule(name: string) {
//     const existing = await this.moduleRepo.findOne({ where: { name } });
//     if (existing) return existing;

//     const module = this.moduleRepo.create({ name });
//     const savedModule = await this.moduleRepo.save(module);

//     // Auto generate CRUD permissions
//     const actions = ['create', 'read', 'update', 'delete'];
//     for (const action of actions) {
//       const permName = `${action}_${name}`;
//       const exists = await this.permRepo.findOne({ where: { name: permName } });
//       if (!exists) {
//         const perm = this.permRepo.create({ name: permName, module: name });
//         await this.permRepo.save(perm);
//       }
//     }

//     return savedModule;
//   }

//   async getModules() {
//     return this.moduleRepo.find();
//   }

//   async deleteModule(id: number) {
//     return this.moduleRepo.delete(id);
//   }

//   // ----------------- PERMISSIONS -----------------
//   async createPermission(name: string, module: string, description?: string) {
//     const existing = await this.permRepo.findOne({ where: { name } });
//     if (existing) return existing;

//     const perm = this.permRepo.create({ name, module, description });
//     return this.permRepo.save(perm);
//   }

//   async getPermissions() {
//     return this.permRepo.find();
//   }

//   async deletePermission(id: number) {
//     return this.permRepo.delete(id);
//   }

//   // ----------------- ROLES -----------------
//   async createRoleWithPermissions(name: string, permissionIds?: number[], description?: string) {
//     const permissions = permissionIds?.length ? await this.permRepo.findBy({ id: In(permissionIds) }) : [];
//     const role = this.roleRepo.create({ name, description, permissions });
//     return this.roleRepo.save(role);
//   }

//   async getRoles() {
//     return this.roleRepo.find({ relations: ['permissions'] });
//   }

//   async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
//     const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
//     if (!role) throw new NotFoundException('Role not found');

//     const permissions = await this.permRepo.findBy({ id: In(permissionIds) });
//     role.permissions = permissions;
//     return this.roleRepo.save(role);
//   }

//   async deleteRole(id: number) {
//     return this.roleRepo.delete(id);
//   }

//   // ----------------- USER ROLES -----------------
//   async assignRoleToUser(userId: number, roleId: number) {
//     const user = await this.userRepo.findOne({ where: { id: userId } });
//     if (!user) throw new NotFoundException('User not found');

//     const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
//     if (!role) throw new NotFoundException('Role not found');

//     user.role = role;
//     await this.userRepo.save(user);
//     return { message: `Role '${role.name}' assigned to user '${user.username}'` };
//   }
// }

// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { Role } from './entities/role.entity/role.entity';
// import { Permission } from './entities/permission.entity/permission.entity';

// @Injectable()
// export class RolesService {
//   constructor(
//     @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
//     @InjectRepository(Permission) private readonly permRepo: Repository<Permission>,
//   ) {}

//   // Create a permission
//   async createPermission(name: string, module: string, description?: string) {
//     const perm = this.permRepo.create({ name, module, description });
//     return this.permRepo.save(perm);
//   }

//   // Create a role
//   async createRole(name: string, description?: string) {
//     const role = this.roleRepo.create({ name, description });
//     return this.roleRepo.save(role);
//   }

//   // Get all roles with permissions
//   async getRoles() {
//     return this.roleRepo.find({ relations: ['permissions'] });
//   }

//   // Get all permissions
//   async getPermissions() {
//     return this.permRepo.find();
//   }

//   // Assign permissions to role
//   async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
//     const role = await this.roleRepo.findOne({ where: { id: roleId }, relations: ['permissions'] });
//     if (!role) throw new NotFoundException('Role not found');

//     const permissions = await this.permRepo.findBy({ id: In(permissionIds) });
//     role.permissions = permissions;

//     return this.roleRepo.save(role);
//   }

//   // Create role with permissions at once
//   async createRoleWithPermissions(name: string, permissionIds?: number[], description?: string) {
//     if (!name || name.trim() === '') {
//       throw new Error('Role name is required');
//     }

//     let permissions: Permission[] = [];
//     if (permissionIds && permissionIds.length > 0) {
//       permissions = await this.permRepo.findBy({ id: In(permissionIds) });
//     }

//     const role = this.roleRepo.create({ name, description, permissions });
//     return this.roleRepo.save(role);
//   }

//   // Auto-generate CRUD permissions for a module
//   async generateModulePermissions(module: string) {
//     const AUTO_GENERATE_MODULES = ['blog', 'products']; // only these tables
//     module = module.toLowerCase();

//     // ❌ skip if module is not in whitelist
//     if (!AUTO_GENERATE_MODULES.includes(module)) {
//       throw new Error(`Permissions for module '${module}' cannot be auto-generated.`);
//     }

//     const actions = ['create', 'read', 'update', 'delete'];
//     const permissions: Permission[] = [];

//     for (const action of actions) {
//       const permName = `${action}_${module}`;
//       const existing = await this.permRepo.findOne({ where: { name: permName } });
//       if (!existing) {
//         const perm = this.permRepo.create({ name: permName, module });
//         permissions.push(await this.permRepo.save(perm));
//       }
//     }

//     return permissions;
//   }
// }
