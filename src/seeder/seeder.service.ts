// src/seeder/seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
import { ModulesService } from 'src/roles/modules/modules.service'; // Import ModulesService

@Injectable()
export class SeederService {
  private readonly logger = new Logger('Seeder');

  constructor(
    @InjectRepository(ModuleEntity) private modulesRepo: Repository<ModuleEntity>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
    private readonly usersService: UsersService,
    private readonly modulesService: ModulesService, // Inject ModulesService
  ) {}

  async seed() {
    // Seed Permissions
    const permSlugs = ['create', 'view', 'update', 'delete'];
    for (const slug of permSlugs) {
      let p = await this.permissionRepo.findOne({ where: { slug } });
      if (!p) {
        p = this.permissionRepo.create({ name: slug, slug });
        await this.permissionRepo.save(p);
      }
    }

    // ✅ Call seedBaseModules to create all modules
    await this.modulesService.seedBaseModules();
    this.logger.log('Base modules seeded ✅');

    // Seed Admin Role
    let adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
    if (!adminRole) {
      adminRole = this.roleRepo.create({ name: 'Admin', slug: 'admin' });
      await this.roleRepo.save(adminRole);
    }

    // ✅ Assign all permissions to admin for ALL modules
    await this.assignAllPermissionsToAdmin(adminRole);
    this.logger.log('Admin permissions assigned ✅');

    // Seed Admin User
    await this.usersService.seedAdmin('admin@example.com', 'admin123');
    this.logger.log('Admin user seeded ✅');

    this.logger.log('All seeding completed successfully 🎉');
  }

  // Helper method to assign all permissions to admin for all modules
  private async assignAllPermissionsToAdmin(adminRole: Role) {
    const allPermissions = await this.permissionRepo.find();
    const allModules = await this.modulesRepo.find();

    for (const module of allModules) {
      for (const permission of allPermissions) {
        const exists = await this.rmpRepo.findOne({
          where: {
            role: { id: adminRole.id },
            module: { id: module.id },
            permission: { id: permission.id },
          },
        });

        if (!exists) {
          const rmp = this.rmpRepo.create({
            role: adminRole,
            module: module,
            permission: permission,
          });
          await this.rmpRepo.save(rmp);
        }
      }
    }
  }
}
