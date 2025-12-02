import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { RoleModulePermission } from './entities/role-module-permission/role-module-permission.entity';
import { ModuleEntity } from './entities/module/module.entity';
import { Permission } from './entities/permission.entity/permission.entity';
import { UsersModule } from 'src/users/users.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RoleModulePermission, ModuleEntity, Permission]),
    forwardRef(() => UsersModule), // 🔹 forwardRef solves circular dependency
    forwardRef(() => ModulesModule), // Use forwardRef here too
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { RolesService } from './roles.service';
// import { RolesController } from './roles.controller';
// import { PermissionsModule } from 'src/permissions/permissions.module';
// import { Role } from './entities/role.entity/role.entity';
// // import { Permission } from './entities/permission.entity/permission.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Module as AppModule } from './entities/module.entity';
// import { ModulesController } from './modules/modules.controller';
// import { ModulesService } from './modules/modules.service';
// import { ModulesModule } from './modules/modules.module';

// // roles.module.ts
// @Module({
//   imports: [
//     PermissionsModule, // Permission repository provider
//     TypeOrmModule.forFeature([Role, AppModule, User]), ModulesModule, // Role repository provider
//   ],
//   providers: [RolesService, ModulesService],
//   controllers: [RolesController, ModulesController],
//   exports: [RolesService, TypeOrmModule], // <-- export Role repository for other modules
// })
// export class RolesModule {}
