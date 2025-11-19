// src/modules/privacy-policy/privacy-policy.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { CreatePrivacyDto } from './dto/create-privacy.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyService: PrivacyPolicyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  create(@Body() dto: CreatePrivacyDto) {
    return this.privacyService.create(dto);
  }

  @Get()
  getCurrent() {
    return this.privacyService.getCurrent();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.privacyService.findOne(slug);
  }

  @Put('current')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  updateCurrent(@Body() dto: UpdatePrivacyDto) {
    return this.privacyService.updateCurrent(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  update(@Param('id') id: number, @Body() dto: UpdatePrivacyDto) {
    return this.privacyService.update(id, dto);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  toggleStatus(@Param('id') id: number) {
    return this.privacyService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Roles('admin')
  remove(@Param('id') id: number) {
    return this.privacyService.remove(id);
  }
}