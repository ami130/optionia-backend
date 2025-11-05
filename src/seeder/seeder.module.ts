// src/seeder/seeder.module.ts
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { PageSeederService } from './page-seeder.service'; // Import new service
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
import { Page } from 'src/modules/pages/entities/page.entity'; // Import Page entity
import { UsersModule } from 'src/users/users.module';
import { ModulesModule } from 'src/roles/modules/modules.module';

@Module({
  imports: [
    UsersModule,
    ModulesModule,
    TypeOrmModule.forFeature([
      ModuleEntity,
      Permission,
      Role,
      RoleModulePermission,
      Page, // Add Page entity
    ]),
  ],
  providers: [SeederService, PageSeederService], // Add PageSeederService
  exports: [SeederService, PageSeederService],
})
export class SeederModule {}
