import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { UploadsService } from '../uploads/uploads.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/enum/userRole.enum';
import { SectionService } from './sections.service';

@Controller('sections')
export class SectionController {
  constructor(
    private readonly sectionService: SectionService,
    private readonly uploadsService: UploadsService,
  ) {}

  private handleFiles(files: Express.Multer.File[], data: any) {
    this.uploadsService.mapFilesToData(files, data, ['image', 'backgroundImage']);
  }

  @Get()
  getAll() {
    return this.sectionService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.sectionService.getOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  async create(@UploadedFiles() files: Express.Multer.File[], @Body() data: CreateSectionDto) {
    if (files?.length) this.handleFiles(files, data);
    return this.sectionService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: new UploadsService().getFileStorage(),
      fileFilter: new UploadsService().fileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: UpdateSectionDto,
  ) {
    if (files?.length) this.handleFiles(files, data);
    return this.sectionService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.sectionService.delete(+id);
  }
}
