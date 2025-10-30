import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { ModuleEntity } from '../entities/module/module.entity';
import { RolesModule } from '../roles.module';
import { RoleModulePermission } from '../entities/role-module-permission/role-module-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, RoleModulePermission]), RolesModule],
  providers: [ModulesService],
  controllers: [ModulesController],
  exports: [ModulesService],
})
export class ModulesModule {}
