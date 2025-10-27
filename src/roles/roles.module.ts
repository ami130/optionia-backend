// src/modules/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { Role } from './entities/role.entity/role.entity';
// import { Permission } from './entities/permission.entity/permission.entity';
import { User } from 'src/users/entities/user.entity';
import { Module as AppModule } from './entities/module.entity';

// roles.module.ts
@Module({
  imports: [
    PermissionsModule, // Permission repository provider
    TypeOrmModule.forFeature([Role, AppModule, User]), // Role repository provider
  ],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule], // <-- export Role repository for other modules
})
export class RolesModule {}
