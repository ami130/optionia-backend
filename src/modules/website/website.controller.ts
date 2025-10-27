// src/modules/website/website.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';

@Controller('websitedata')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  /**
   ** ✅ Create a new page
   * Admins only
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreatePageDto) {
    return this.websiteService.create(dto);
  }

  /**
   * ✅ Get all pages
   * Public
   */
  @Get()
  async findAll() {
    return this.websiteService.findAll();
  }

  /**
   * ✅ Get single page by key
   * Public
   */
  @Get(':key')
  async findByKey(@Param('key') key: string) {
    return this.websiteService.findByKey(key);
  }

  /**
   * ✅ Update page by key
   * Admins only
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':key')
  async update(@Param('key') key: string, @Body() dto: UpdatePageDto) {
    return this.websiteService.update(key, dto);
  }

  /**
   * ✅ Delete page by key
   * Admins only
   */
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':key')
  async remove(@Param('key') key: string) {
    return this.websiteService.remove(key);
  }
}
