// src/modules/partners/partners.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Query,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import { UploadsService } from 'src/modules/uploads/uploads.service';
import { PartnersService } from './partner.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly service: PartnersService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ✅ GET PARTNERS LIST WITH PAGE (main endpoint like blog)
  @Get()
  async getPartnersListWithPage(@Query('status') status?: string, @Query('categoryId') categoryId?: string) {
    const filters: any = {};

    if (status !== undefined) {
      filters.status = status === 'true' || status === '1';
    }

    if (categoryId !== undefined) {
      filters.categoryId = parseInt(categoryId);
    }

    return this.service.getPartnersListWithPage(filters);
  }

  // ✅ GET SINGLE PARTNER
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }


  // ✅ CREATE PARTNER (Admin only)
  @UseModule('partners')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('create')
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
      limits: { files: 1 }, // Only 1 logo file
    }),
  )
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() dto: any, @Req() req: any) {


    // ✅ Ensure required fields
    if (!dto.name) throw new BadRequestException('name is required');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');

    // ✅ Parse categoryId to number
    dto.categoryId = parseInt(dto.categoryId);

    // ✅ Parse status if provided as string
    if (dto.status) {
      dto.status = dto.status === 'true' || dto.status === '1';
    }

    return this.service.create(dto, files);
  }

  // ✅ UPDATE PARTNER (Admin only)
  @UseModule('partners')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
      limits: { files: 1 }, // Only 1 logo file
    }),
  )
  async update(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[], @Body() dto: any) {
    console.log('🔄 Received partner update request for ID:', id);
    console.log('📊 Update data:', dto);

    // ✅ Parse categoryId to number if provided
    if (dto.categoryId) {
      dto.categoryId = parseInt(dto.categoryId);
    }

    // ✅ Parse status if provided as string
    if (dto.status !== undefined) {
      dto.status = dto.status === 'true' || dto.status === '1';
    }

    return this.service.update(id, dto, files);
  }

  // ✅ TOGGLE STATUS (Admin only)
  @UseModule('partners')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleStatus(id);
  }

  // ✅ DELETE PARTNER (Admin only)
  @UseModule('partners')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
