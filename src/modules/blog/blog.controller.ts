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
  async create(@Body() dto: CreateBlogDto, @UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    if (!dto.pageId) throw new BadRequestException('pageId is required');
    if (!dto.categoryId) throw new BadRequestException('categoryId is required');

    if (files?.length) this.handleFiles(files, dto);
    return this.service.create(dto, req.user);
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
    @Body() dto: UpdateBlogDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @Body('imageIndexMap') imageIndexMap?: Record<string, number>,
  ) {
    const imageFiles = (files || []).filter((f) => f.fieldname === 'image');
    if (imageFiles.length > 5) {
      throw new BadRequestException('You can upload up to 5 images only.');
    }
    return this.service.update(id, dto, files, imageIndexMap);
  }

  // ✅ DELETE BLOG (Admin only)
  @Permissions('delete')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
