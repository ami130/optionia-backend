// src/permissions/permissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  exports: [TypeOrmModule], // <-- important to make repository available
})
export class PermissionsModule {}
