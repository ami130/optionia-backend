import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { UploadsModule } from 'src/modules/uploads/Upload.moudle';
import { ModuleEntity } from 'src/roles/entities/module/module.entity';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleModulePermission, Permission, ModuleEntity, UploadsModule])],
  providers: [PermissionGuard],
  exports: [
    PermissionGuard,
    TypeOrmModule.forFeature([RoleModulePermission, Permission, ModuleEntity]), // 🔑 export repository
  ],
})
export class SharedModule {}
