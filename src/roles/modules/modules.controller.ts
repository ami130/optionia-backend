// src/modules/modules.controller.ts
import { UpdateModuleDto } from '../dto/update-module.dto';
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateModuleDto } from '../dto/create-module.dto';

@Controller('modules')
export class ModulesController {
  constructor(private svc: ModulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can create
  create(@Body() dto: CreateModuleDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Only admin can update
  update(@Param('id') id: number, @Body() dto: UpdateModuleDto) {
    return this.svc.update(id, dto);
  }
}
