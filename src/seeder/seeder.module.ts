// src/seeder/seeder.module.ts
import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([ModuleEntity, Permission, Role, RoleModulePermission])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
