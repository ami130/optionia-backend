// src/modules/blog/blog.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Permissions } from 'src/permissions/decorators/permissions.decorator';
import { UseModule } from 'src/common/interceptors/use-module.decorator';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UploadsService } from '../uploads/uploads.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@UseModule('blog')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Controller('blog')
export class BlogController {
  constructor(
    private readonly service: BlogService,
    private readonly uploadsService: UploadsService,
  ) {}

  private handleFiles(
    files: Express.Multer.File[],
    data: any,
    existingData?: any,
    imageIndexMap?: Record<string, number>,
  ) {
    this.uploadsService.mapFilesToData(files, data, ['thumbnailUrl', 'image'], existingData, {
      arrayIndex: imageIndexMap,
    });
  }

  // ✅ CREATE BLOG (Admin only)
  @Permissions('create')
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
      limits: { files: 6 },
    }),
  )
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() dto: any, @Req() req: any) {
    // ✅ Ensure required IDs
    if (!dto.pageId) throw new BadRequestException('pageId is required');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');

    // ✅ Normalize authorIds and tagIds
    if (dto.authorIds) {
      dto.authorIds = typeof dto.authorIds === 'string' ? JSON.parse(dto.authorIds) : dto.authorIds;
      if (!Array.isArray(dto.authorIds)) dto.authorIds = [dto.authorIds];
      dto.authorIds = dto.authorIds.map((id: any) => +id);
    }

    if (dto.tagIds) {
      dto.tagIds = typeof dto.tagIds === 'string' ? JSON.parse(dto.tagIds) : dto.tagIds;
      if (!Array.isArray(dto.tagIds)) dto.tagIds = [dto.tagIds];
      dto.tagIds = dto.tagIds.map((id: any) => +id);
    }

    // ✅ Pass files to service instead of handling in controller
    return this.service.create(dto, req.user, files);
  }

  // ✅ UPDATE BLOG (Admin only)
  @Permissions('update')
  @Patch(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
      limits: { files: 6 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any, // Use any to handle mixed data
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let updateData: UpdateBlogDto = {};
    let imageIndexMap: Record<string, number> = {};

    try {
      // Parse the data field if it exists (from FormData)
      if (dto.data && typeof dto.data === 'string') {
        const parsedData = JSON.parse(dto.data);
        updateData = { ...parsedData };

        // Extract imageIndexMap from parsed data
        if (parsedData.imageIndexMap) {
          imageIndexMap = parsedData.imageIndexMap;
          delete parsedData.imageIndexMap;
        }
      } else {
        // Handle regular form data
        updateData = { ...dto };

        // Parse imageIndexMap if it exists
        if (dto.imageIndexMap) {
          if (typeof dto.imageIndexMap === 'string') {
            imageIndexMap = JSON.parse(dto.imageIndexMap);
          } else if (typeof dto.imageIndexMap === 'object') {
            imageIndexMap = dto.imageIndexMap;
          }
          delete updateData.imageIndexMap;
        }
      }

      // Ensure arrays are properly formatted
      if (updateData.authorIds && !Array.isArray(updateData.authorIds)) {
        updateData.authorIds = [updateData.authorIds];
      }

      if (updateData.tagIds && !Array.isArray(updateData.tagIds)) {
        updateData.tagIds = [updateData.tagIds];
      }
    } catch (error) {
      throw new BadRequestException('Invalid data format');
    }

    // Validate image files count
    const imageFiles = (files || []).filter((f) => f.fieldname === 'image');
    if (imageFiles.length > 5) {
      throw new BadRequestException('You can upload up to 5 images only.');
    }

    return this.service.update(id, updateData, files, imageIndexMap, req.user);
  }

  // ✅ DELETE BLOG (Admin only)
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
