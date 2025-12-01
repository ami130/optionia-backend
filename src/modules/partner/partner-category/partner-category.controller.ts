// src/modules/partner-categories/partner-categories.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Query, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { PartnerCategoriesService } from './partner-category.service';
import { CreatePartnerCategoryDto, UpdatePartnerCategoryDto } from './dto/create-partner-category.dto';
import { UseModule } from 'src/common/interceptors/use-module.decorator';

@Controller('partner-categories')
export class PartnerCategoriesController {
  constructor(private readonly service: PartnerCategoriesService) {}

  // Public endpoints - no authentication required
  @Get()
  async findAll(@Query('status') status?: string) {
    let statusBoolean: boolean | undefined;

    if (status !== undefined) {
      statusBoolean = status === 'true' || status === '1';
    }

    return this.service.findAll(statusBoolean);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Protected endpoints - require authentication and permissions
  @UseModule('partner-categories')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('create')
  @Post()
  async create(@Body() dto: CreatePartnerCategoryDto) {
    return this.service.create(dto);
  }

  @UseModule('partner-categories')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerCategoryDto) {
    return this.service.update(id, dto);
  }

  @UseModule('partner-categories')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleStatus(id);
  }

  @UseModule('partner-categories')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
