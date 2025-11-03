import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { RolesModule } from 'src/roles/roles.module';
import { RoleModulePermission } from 'src/roles/entities/role-module-permission/role-module-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, RoleModulePermission]),
    forwardRef(() => RolesModule), // 🔹 forwardRef solves circular dependency
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
