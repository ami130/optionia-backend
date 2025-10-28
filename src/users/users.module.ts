import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => RolesModule), // 🔹 forwardRef solves circular dependency
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersService } from './users.service';
// import { UsersController } from './users.controller';
// import { User } from './entities/user.entity';
// import { Role } from 'src/roles/entities/role.entity/role.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User, Role]), // User repository
//     // RolesModule, // Role repository
//     // PermissionsModule, // Permission repository
//   ],
//   providers: [UsersService],
//   controllers: [UsersController],
//   exports: [UsersService],
// })

// // @Module({
// //   imports: [TypeOrmModule.forFeature([User])],
// //   providers: [UsersService, IsUniqueConstraint],
// //   controllers: [UsersController],
// //   exports: [UsersService, IsUniqueConstraint],
// // })
// export class UsersModule {}
