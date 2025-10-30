// src/modules/modules.controller.ts
import { UpdateModuleDto } from '../dto/update-module.dto';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { CreateModuleDto } from '../dto/create-module.dto';
import { UseModule } from 'src/common/interceptors/use-module.decorator';

@Controller('modules')
@UseModule('module') // Set module for permission checking
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard) // All three guards
export class ModulesController {
  constructor(private svc: ModulesService) {}

  @Post()
  @Permissions('create') // Requires 'create' permission for 'module' module
  create(@Body() dto: CreateModuleDto) {
    return this.svc.create(dto);
  }

  @Get()
  // @Permissions('view')x // Requires 'view' permission for 'module' module
  list() {
    return this.svc.findAll();
  }

  @Patch(':id')
  @Permissions('update') // Requires 'update' permission for 'module' module
  update(@Param('id') id: number, @Body() dto: UpdateModuleDto) {
    return this.svc.update(id, dto);
  }
}
