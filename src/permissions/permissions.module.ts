// // src/permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from 'src/roles/entities/permission.entity/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}

// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PermissionsService } from './permissions.service';
// import { PermissionsController } from './permissions.controller';

// @Module({
//   imports: [TypeOrmModule.forFeature([])],
//   exports: [TypeOrmModule],
//   providers: [PermissionsService],
//   controllers: [PermissionsController], // <-- important to make repository available
// })
// export class PermissionsModule {}
