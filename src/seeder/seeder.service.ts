// src/seeder/seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger('Seeder');

  constructor(
    @InjectRepository(ModuleEntity) private modulesRepo: Repository<ModuleEntity>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
    private readonly usersService: UsersService, // ✅ UsersService injected properly
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

    // Seed Blog Module
    let blogModule = await this.modulesRepo.findOne({ where: { slug: 'blog' } });
    if (!blogModule) {
      blogModule = this.modulesRepo.create({ name: 'Blog', slug: 'blog' });
      await this.modulesRepo.save(blogModule);
    }

    // Seed Admin Role
    let adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
    if (!adminRole) {
      adminRole = this.roleRepo.create({ name: 'Admin', slug: 'admin' });
      await this.roleRepo.save(adminRole);
    }

    // Assign all permissions to admin
    const allPermissions = await this.permissionRepo.find();
    for (const p of allPermissions) {
      const exists = await this.rmpRepo.findOne({
        where: { role: { id: adminRole.id }, module: { id: blogModule.id }, permission: { id: p.id } },
      });
      if (!exists) {
        const rmp = this.rmpRepo.create({ role: adminRole, module: blogModule, permission: p });
        await this.rmpRepo.save(rmp);
      }
    }

    // Seed Admin User
    await this.usersService.seedAdmin('admin@example.com', 'admin123');

    this.logger.log('Seeding done ✅');
  }
}
