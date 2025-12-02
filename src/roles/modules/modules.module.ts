// modules.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleEntity } from '../entities/module/module.entity';
import { RoleModulePermission } from '../entities/role-module-permission/role-module-permission.entity';
import { Permission } from '../entities/permission.entity/permission.entity';
import { RolesModule } from '../roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, Permission, RoleModulePermission]), forwardRef(() => RolesModule)],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ModulesService } from './modules.service';
// import { ModulesController } from './modules.controller';
// import { ModuleEntity } from '../entities/module/module.entity';
// import { RolesModule } from '../roles.module';
// import { RoleModulePermission } from '../entities/role-module-permission/role-module-permission.entity';
// import { Permission } from '../entities/permission.entity/permission.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([ModuleEntity, Permission, RoleModulePermission]), RolesModule],
//   providers: [ModulesService],
//   controllers: [ModulesController],
//   exports: [ModulesService],
// })
// export class ModulesModule {}
