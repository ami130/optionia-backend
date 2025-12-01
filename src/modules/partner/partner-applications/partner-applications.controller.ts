// src/modules/partner-applications/partner-applications.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PartnerApplicationsService } from './partner-applications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import {
  CreatePartnerApplicationDto,
  UpdatePartnerApplicationDto,
  UpdateContactedDto,
} from './dto/create-partner-application.dto';

@Controller('partner-applications')
export class PartnerApplicationsController {
  constructor(private readonly service: PartnerApplicationsService) {}

  // ✅ PUBLIC ENDPOINT - Submit application
  @Post()
  async create(@Body() dto: CreatePartnerApplicationDto) {
    return this.service.create(dto);
  }

  // ✅ ADMIN ENDPOINTS

  // Get all applications with filters
  @UseModule('partner-applications')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Permissions('view')
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('contacted') contacted?: string,
    @Query('search') search?: string,
    @Query('partnerType') partnerType?: string,
  ) {
    const filters: any = {};

    if (page) filters.page = parseInt(page, 10);
    if (limit) filters.limit = parseInt(limit, 10);
    if (contacted !== undefined) {
      filters.contacted = contacted === 'true' || contacted === '1';
    }
    if (search) filters.search = search;
    if (partnerType) filters.partnerType = partnerType;

    return this.service.findAll(filters);
  }

  // Get single application by ID
  @UseModule('partner-applications')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Permissions('view')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // Update application
  @UseModule('partner-applications')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Permissions('update')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePartnerApplicationDto) {
    return this.service.update(id, dto);
  }

  // Update contacted status only
  @UseModule('partner-applications')
//   @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
//   @Permissions('update')
  @Put(':id/contacted')
  @HttpCode(HttpStatus.OK)
  async updateContacted(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateContactedDto) {
    if (body.contacted === undefined) {
      throw new BadRequestException('Contacted status is required');
    }
    return this.service.updateContacted(id, body.contacted);
  }

  // Delete application
  @UseModule('partner-applications')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('delete')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
