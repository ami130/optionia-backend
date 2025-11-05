// src/seeder/seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/users.service';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
import { ModulesService } from 'src/roles/modules/modules.service';
import { PageSeederService } from './page-seeder.service'; // Import the new service

@Injectable()
export class SeederService {
  private readonly logger = new Logger('Seeder');

  constructor(
    @InjectRepository(ModuleEntity) private modulesRepo: Repository<ModuleEntity>,
    @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
    private readonly usersService: UsersService,
    private readonly modulesService: ModulesService,
    private readonly pageSeederService: PageSeederService, // Inject page seeder
  ) {}

  async seed() {
    this.logger.log('🚀 Starting database seeding...');

    try {
      // Seed Permissions
      this.logger.log('Seeding permissions...');
      const permSlugs = ['create', 'view', 'update', 'delete'];
      for (const slug of permSlugs) {
        let p = await this.permissionRepo.findOne({ where: { slug } });
        if (!p) {
          p = this.permissionRepo.create({ name: slug, slug });
          await this.permissionRepo.save(p);
          this.logger.log(`✅ Permission created: ${slug}`);
        } else {
          this.logger.log(`ℹ️ Permission already exists: ${slug}`);
        }
      }

      // ✅ Call seedBaseModules to create all modules (including Role)
      this.logger.log('Seeding base modules...');
      await this.modulesService.seedBaseModules();
      this.logger.log('✅ Base modules seeded');

      // Seed Admin Role
      this.logger.log('Seeding admin role...');
      let adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
      if (!adminRole) {
        adminRole = this.roleRepo.create({ name: 'Admin', slug: 'admin' });
        await this.roleRepo.save(adminRole);
        this.logger.log('✅ Admin role created');
      } else {
        this.logger.log('ℹ️ Admin role already exists');
      }

      // ✅ Assign all permissions to admin for ALL modules (including Role module)
      this.logger.log('Assigning permissions to admin role...');
      await this.assignAllPermissionsToAdmin(adminRole);
      this.logger.log('✅ Admin permissions assigned');

      // ✅ Seed Blog Page and Default Pages
      this.logger.log('Seeding pages...');
      await this.pageSeederService.seedBlogPage();
      await this.pageSeederService.seedDefaultPages();
      this.logger.log('✅ Pages seeded');

      // Seed Admin User
      this.logger.log('Seeding admin user...');
      await this.usersService.seedAdmin('admin@example.com', 'admin123');
      this.logger.log('✅ Admin user seeded');

      this.logger.log('🎉 All seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  // Helper method to assign all permissions to admin for all modules
  private async assignAllPermissionsToAdmin(adminRole: Role) {
    const allPermissions = await this.permissionRepo.find();
    const allModules = await this.modulesRepo.find();

    this.logger.log(`Found ${allPermissions.length} permissions and ${allModules.length} modules`);

    let assignedCount = 0;
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
          assignedCount++;
        }
      }
    }
    this.logger.log(`✅ Assigned ${assignedCount} permission-module combinations to admin`);
  }
}

// // src/seeder/seeder.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UsersService } from 'src/users/users.service';
// import { ModuleEntity } from 'src/roles/entities/module/module.entity';
// import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
// import { Role } from 'src/roles/entities/role.entity';
// import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
// import { ModulesService } from 'src/roles/modules/modules.service'; // Import ModulesService

// @Injectable()
// export class SeederService {
//   private readonly logger = new Logger('Seeder');

//   constructor(
//     @InjectRepository(ModuleEntity) private modulesRepo: Repository<ModuleEntity>,
//     @InjectRepository(Permission) private permissionRepo: Repository<Permission>,
//     @InjectRepository(Role) private roleRepo: Repository<Role>,
//     @InjectRepository(RoleModulePermission) private rmpRepo: Repository<RoleModulePermission>,
//     private readonly usersService: UsersService,
//     private readonly modulesService: ModulesService, // Inject ModulesService
//   ) {}

//   async seed() {
//     // Seed Permissions
//     const permSlugs = ['create', 'view', 'update', 'delete'];
//     for (const slug of permSlugs) {
//       let p = await this.permissionRepo.findOne({ where: { slug } });
//       if (!p) {
//         p = this.permissionRepo.create({ name: slug, slug });
//         await this.permissionRepo.save(p);
//       }
//     }

//     // ✅ Call seedBaseModules to create all modules
//     await this.modulesService.seedBaseModules();
//     this.logger.log('Base modules seeded ✅');

//     // Seed Admin Role
//     let adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
//     if (!adminRole) {
//       adminRole = this.roleRepo.create({ name: 'Admin', slug: 'admin' });
//       await this.roleRepo.save(adminRole);
//     }

//     // ✅ Assign all permissions to admin for ALL modules
//     await this.assignAllPermissionsToAdmin(adminRole);
//     this.logger.log('Admin permissions assigned ✅');

//     // Seed Admin User
//     await this.usersService.seedAdmin('admin@example.com', 'admin123');
//     this.logger.log('Admin user seeded ✅');

//     this.logger.log('All seeding completed successfully 🎉');
//   }

//   // Helper method to assign all permissions to admin for all modules
//   private async assignAllPermissionsToAdmin(adminRole: Role) {
//     const allPermissions = await this.permissionRepo.find();
//     const allModules = await this.modulesRepo.find();

//     for (const module of allModules) {
//       for (const permission of allPermissions) {
//         const exists = await this.rmpRepo.findOne({
//           where: {
//             role: { id: adminRole.id },
//             module: { id: module.id },
//             permission: { id: permission.id },
//           },
//         });

//         if (!exists) {
//           const rmp = this.rmpRepo.create({
//             role: adminRole,
//             module: module,
//             permission: permission,
//           });
//           await this.rmpRepo.save(rmp);
//         }
//       }
//     }
//   }
// }
