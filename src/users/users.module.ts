import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { IsUniqueConstraint } from 'src/validators/is-unique.validator';
import { RolesModule } from 'src/roles/roles.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // User repository
    RolesModule, // Role repository
    PermissionsModule, // Permission repository
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})

// @Module({
//   imports: [TypeOrmModule.forFeature([User])],
//   providers: [UsersService, IsUniqueConstraint],
//   controllers: [UsersController],
//   exports: [UsersService, IsUniqueConstraint],
// })
export class UsersModule {}
